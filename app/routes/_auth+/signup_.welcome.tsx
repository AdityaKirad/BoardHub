import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import type { Route } from "./+types/signup_.welcome";
import { z } from "zod";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form, redirect } from "react-router";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { Field } from "~/components/ui/form";
import { Button } from "~/components/ui/button";
import { BadgeCheckIcon } from "lucide-react";
import { checkHoneyPot } from "~/.server/honeypot";
import { db } from "~/.server/db";
import { checkCommonPassword, signup } from "~/.server/authentication";
import { handleNewSession } from "./login.server";
import { requireVerificationContext } from "./signup.server";
import { PasswordStrengthMeter } from "./+password-strength-meter";
import { useEffect, useState } from "react";
import type { PasswordStrengthResult } from "~/lib/password-strength";
import { checkPasswordStrength } from "~/lib/password-strength";

const schema = z.object({
  name: z.string(),
  password: z.string().min(8),
});

export const meta: Route.MetaFunction = () => [
  {
    title: "Finish setting up your account - Log in with your BoardHub account",
  },
];

export const loader = ({ request }: Route.LoaderArgs) =>
  requireVerificationContext(request, {
    scope: "setup-account",
    verified: true,
  });

export async function action({ request }: Route.ActionArgs) {
  const { email } = await requireVerificationContext(request, {
    scope: "setup-account",
    verified: true,
  });

  const formData = await request.formData();

  await checkHoneyPot(formData);

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { name, password } = submission.value;

  const isTaken = await db.query.user.findFirst({
    columns: { id: true },
    where: (user, { eq }) => eq(user.email, email),
  });

  const redirectTo = new URL(request.url).searchParams.get("redirectTo");

  if (isTaken) {
    return redirect(
      `/login?email=${encodeURIComponent(email)}&infoCode=existingUserSignupAttempt`,
    );
  }

  const isCommonPassword = await checkCommonPassword(password);

  if (isCommonPassword) {
    return submission.reply({
      fieldErrors: { password: ["The password you entered is too common."] },
    });
  }

  try {
    const { session, user } = await signup(request, {
      password,
      userInfo: {
        name,
        email,
        verified: true,
      },
    });

    return handleNewSession({
      redirectTo,
      session,
      user,
    });
  } catch (error) {
    return submission.reply({
      formErrors: ["Something went wrong. Please try again"],
    });
  }
}

export default function Page({ actionData, loaderData }: Route.ComponentProps) {
  const [password, passwordSet] = useState("");
  const [strength, strengthSet] = useState<PasswordStrengthResult>({
    label: null,
    score: null,
  });
  const [form, fields] = useForm({
    id: "setup-account",
    lastResult: actionData,
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    constraint: getZodConstraint(schema),
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
  });

  useEffect(() => {
    const timeout = setTimeout(
      () => strengthSet(checkPasswordStrength(password)),
      150,
    );
    return () => clearTimeout(timeout);
  });
  return (
    <>
      <div className="flex flex-col items-center">
        <h1 className="flex items-center justify-center gap-1 text-lg font-bold">
          Email address verified
          <BadgeCheckIcon className="stroke-background fill-green-600" />
        </h1>
        <h2 className="text-sm font-bold">Finish setting up your account</h2>
      </div>
      <Form
        className="mt-4 flex flex-col gap-2"
        method="POST"
        {...getFormProps(form)}>
        <div className="text-sm font-medium">
          <p>Email address</p>
          <p className="py-1">{loaderData.email}</p>
        </div>

        <Field
          inputProps={{
            ...getInputProps(fields.name, { type: "text" }),
            placeholder: "Enter your full name",
          }}
          labelProps={{ children: "Full name" }}
          errors={fields.name.errors}
        />

        <Field
          inputProps={{
            placeholder: "Enter new password",
            onChange: (e) => passwordSet(e.target.value),
            ...getInputProps(fields.password, { type: "password" }),
          }}
          labelProps={{ children: "Create password" }}
          errors={fields.password.errors}>
          <PasswordStrengthMeter score={strength.score ?? -1} />
          <p className="text-muted-foreground text-center text-xs">
            {strength?.label ?? "Password must have at least 8 characters"}
          </p>
        </Field>

        <HoneypotInputs />

        <Button type="submit">Continue</Button>
      </Form>
    </>
  );
}
