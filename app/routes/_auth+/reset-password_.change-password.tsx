/* eslint-disable @typescript-eslint/only-throw-error */

import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import type { Route } from "./+types/reset-password_.change-password";
import { z } from "zod";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form, redirect } from "react-router";
import { Field } from "~/components/ui/form";
import { useIsPending } from "~/hooks/use-is-pending";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { Button } from "~/components/ui/button";
import type { PasswordStrengthResult } from "~/lib/password-strength";
import {
  checkPasswordStrength,
  MIN_PASSWORD_LENGTH,
} from "~/lib/password-strength";
import { useEffect, useState } from "react";
import { PasswordStrengthMeter } from "./+password-strength-meter";
import {
  resetPassword,
  validateVerificationCode,
} from "~/.server/authentication";
import { parseSignedToken } from "~/.server/crypto";
import { JWTExpired } from "jose/errors";

const schema = z.object({
  password: z.string().min(MIN_PASSWORD_LENGTH),
});

export const ErrorCodes = {
  changed: "already_changed_password",
  invalid: "invalid_token",
  expired: "expired_token",
};

async function requireVerificationContext(request: Request) {
  const signature = new URL(request.url).searchParams.get("signature");

  if (!signature) {
    throw redirect(
      `/reset-password?message=${encodeURIComponent(ErrorCodes.invalid)}`,
    );
  }

  try {
    const {
      payload: { jti, scope, sub },
    } = await parseSignedToken(signature);

    if (!jti || !sub || scope !== "password-reset") {
      throw redirect(
        `/reset-password?message=${encodeURIComponent(ErrorCodes.invalid)}`,
      );
    }

    return { jti, target: sub, type: scope };
  } catch (error) {
    if (error instanceof JWTExpired) {
      throw redirect(
        `/reset-password?message=${encodeURIComponent(ErrorCodes.expired)}`,
      );
    }

    throw redirect(
      `/reset-password?message=${encodeURIComponent(ErrorCodes.invalid)}`,
    );
  }
}

export const meta: Route.MetaFunction = () => [
  {
    title: "Choose a new password - Log in with BoardHub account",
  },
];

export const loader = ({ request }: Route.LoaderArgs) =>
  requireVerificationContext(request);

export async function action({ request }: Route.ActionArgs) {
  const { jti, target, type } = await requireVerificationContext(request);

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const isValid = await validateVerificationCode({
    target,
    type,
    code: jti,
  });

  if (!isValid) {
    return redirect(
      `/reset-password?message=${encodeURIComponent(ErrorCodes.changed)}`,
    );
  }

  try {
    await resetPassword({
      userId: target,
      password: submission.value.password,
    });
  } catch (error) {
    console.error(`Failed to reset password for user ${target}:`, error);

    return submission.reply({
      formErrors: ["Something went wrong. Please try again later."],
    });
  }

  return redirect("/login");
}

export default function Page({ actionData }: Route.ComponentProps) {
  const isPending = useIsPending();
  const [password, passwordSet] = useState("");
  const [strength, strengthSet] = useState<PasswordStrengthResult>({
    score: null,
    label: null,
  });
  const [form, fields] = useForm({
    id: "change-password",
    lastResult: actionData,
    constraint: getZodConstraint(schema),
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
  });

  useEffect(() => {
    const timeout = setTimeout(
      () => strengthSet(checkPasswordStrength(password)),
      150,
    );

    return () => clearTimeout(timeout);
  }, [password]);

  return (
    <>
      <h1 className="text-center font-medium text-blue-950">
        Choose a new password
      </h1>

      <Form
        className="flex flex-col gap-2"
        method="POST"
        {...getFormProps(form)}>
        <Field
          labelProps={{
            children: "Password",
          }}
          inputProps={{
            placeholder: "Enter new password",
            onChange: (e) => passwordSet(e.target.value),
            ...getInputProps(fields.password, {
              type: "password",
            }),
          }}
          errors={fields.password.errors}>
          <PasswordStrengthMeter score={strength.score ?? -1} />
          <p className="text-muted-foreground text-center text-xs">
            {strength?.label ?? "Password must have at least 8 characters"}
          </p>
        </Field>

        <HoneypotInputs />

        <Button type="submit" size="lg" disabled={isPending}>
          Continue
        </Button>
      </Form>
    </>
  );
}
