import { checkHoneyPot } from "~/.server/honeypot";
import type { Route } from "./+types/signup";
import { z } from "zod";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { Form, Link, redirect, useSearchParams } from "react-router";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/form";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { useIsPending } from "~/hooks/use-is-pending";
import { DiscordIcon } from "~/components/icons/discord";
import { GithubIcon } from "~/components/icons/github";
import { db } from "~/.server/db";
import { createVerification } from "~/.server/authentication";
import { sendEmail } from "~/.server/email";
import { VerificationEmail } from "~/components/verification-email";
import { getSignedToken } from "~/.server/crypto";

const schema = z.object({
  email: z.string().email().trim().toLowerCase(),
});

export const signupErrorCodes = {
  error: "verify.email.error",
  expired: "verify.email.expired",
};

export const meta: Route.MetaFunction = () => [
  {
    title: "Sign up - Log in with BoardHub account",
  },
];

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  await checkHoneyPot(formData);

  const submission = parseWithZod(formData, {
    schema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { email } = submission.value;

  const isTaken = await db.query.user.findFirst({
    columns: { id: true },
    where: (user, { eq }) => eq(user.email, email),
  });

  if (isTaken) {
    return redirect(
      `/login?email=${encodeURIComponent(email)}&infoCode=existingUserSignupAttempt`,
    );
  }

  const verification = await createVerification({
    target: email,
    type: "signup",
  });

  if (!verification) {
    return submission.reply({
      formErrors: ["Something went wrong. Please try again"],
    });
  }

  const { value: code, expiresAt: exp } = verification;

  const signature = await getSignedToken({
    sub: email,
    scope: "signup",
    exp: Math.floor(exp.getTime() / 1000),
  });

  const { success } = await sendEmail({
    to: email,
    subject: `${code} is your verification code`,
    react: VerificationEmail({ email, code, type: "signup" }),
  });

  if (!success) {
    return submission.reply({
      formErrors: ["Something went wrong. Please try again"],
    });
  }

  const url = new URL(request.url);

  url.pathname = "/signup/verify-email";
  url.searchParams.set("signature", signature);

  return redirect(url.toString());
}

export default function Page({ actionData }: Route.ComponentProps) {
  const isPending = useIsPending();
  const [searchParams] = useSearchParams();
  const [form, fields] = useForm({
    id: "signup",
    defaultValue: {
      email: searchParams.get("email"),
    },
    lastResult: actionData,
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    constraint: getZodConstraint(schema),
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
  });

  return (
    <>
      <h1 className="text-center text-lg font-bold text-blue-950">
        Sign up to continue.
      </h1>

      <Form className="space-y-2" method="POST" {...getFormProps(form)}>
        <Field
          inputProps={{
            ...getInputProps(fields.email, { type: "email" }),
            placeholder: "Enter your email",
          }}
          labelProps={{ children: "Email" }}
          errors={fields.email.errors}
        />

        <HoneypotInputs />

        <Button
          className="mt-4 w-full"
          type="submit"
          size="lg"
          disabled={isPending}>
          Create Account
        </Button>
      </Form>

      <p className="text-muted-foreground text-center text-sm font-semibold">
        Or continue with:
      </p>

      <Form className="contents" method="POST">
        <Button variant="outline" formAction="/login/discord">
          <DiscordIcon />
          Discord
        </Button>

        <Button variant="outline" formAction="/login/github">
          <GithubIcon />
          GitHub
        </Button>
      </Form>

      <div className="flex items-center justify-center gap-2">
        <Button className="p-0 text-blue-500" variant="link" asChild>
          <Link
            to={{
              pathname: "login",
              search: fields.email.value
                ? `?email=${encodeURIComponent(fields.email.value)}`
                : "",
            }}>
            Already have an BoardHub account? Log in
          </Link>
        </Button>
      </div>
    </>
  );
}
