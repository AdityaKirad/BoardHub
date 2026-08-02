import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { createVerification } from "~/.server/authentication";
import { db } from "~/.server/db";
import { sendEmail } from "~/.server/email";
import { checkHoneyPot } from "~/.server/honeypot";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/form";
import { Separator } from "~/components/ui/separator";
import { VerificationEmail } from "~/components/verification-email";
import { env } from "~/env.server";
import { useIsPending } from "~/hooks/use-is-pending";
import { useState } from "react";
import { Form, Link, redirect, useSearchParams } from "react-router";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { z } from "zod";
import type { Route } from "./+types/reset-password";
import EmailIllustration from "~/assets/email-illustration.webp";
import { ErrorCodes } from "./reset-password_.change-password";
import { AlertTriangleIcon } from "lucide-react";
import { getSignedToken } from "~/.server/crypto";

const schema = z.object({
  email: z.string().email().trim().toLowerCase(),
});

const error = {
  [ErrorCodes.changed]:
    "The recovery link you selected has already been used to change your password. Re-submit your email address to receive a new recovery link.",
  [ErrorCodes.expired]:
    "The recovery link you selected has expired. Re-submit your email address to receive a new recovery link.",
  [ErrorCodes.invalid]:
    "The recovery link you selected is broken. Re-submit your email address to receive a new recovery link.",
};

export const meta: Route.MetaFunction = () => [
  { title: "Can't log in? Log in with BoardHub account" },
];

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  await checkHoneyPot(formData);

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return { result: submission.reply() };
  }

  const user = await db.query.user.findFirst({
    columns: { id: true, email: true },
    where: (user, { eq }) => eq(user.email, submission.value.email),
  });

  if (user) {
    const verification = await createVerification({
      target: user.id,
      type: "password-reset",
    });

    if (!verification) {
      return {
        result: submission.reply({
          formErrors: ["Something went wrong. Please try again later."],
        }),
      };
    }

    const signature = await getSignedToken({
      sub: user.id,
      scope: "password-reset",
      jti: verification.value,
      exp: Math.floor(verification.expiresAt.getTime() / 1000),
    });

    const { success } = await sendEmail({
      to: user.email,
      subject: "Set your new Trellix password",
      react: VerificationEmail({
        type: "password-reset",
        email: user.email,
        url: `${env.APP_URL}/reset-password/change-password?signature=${encodeURIComponent(signature)}`,
      }),
    });

    if (!success) {
      return {
        result: submission.reply({
          formErrors: ["Something went wrong. Please try again later."],
        }),
      };
    }
  }

  const searchParams = new URLSearchParams({
    email: submission.value.email,
    recoveryLinkSent: "true",
  });

  return redirect(`/reset-password?${searchParams}`);
}

export default function Page({ actionData }: Route.ComponentProps) {
  const isPending = useIsPending();
  const [searchParams] = useSearchParams();
  const [emailInput, setEmailInput] = useState(searchParams.get("email") ?? "");
  const [form, fields] = useForm({
    id: "reset-password",
    defaultValue: {
      email: searchParams.get("email"),
    },
    lastResult: actionData?.result,
    shouldValidate: "onBlur",
    constraint: getZodConstraint(schema),
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
  });

  const errorMessage = error[searchParams.get("message")!];

  const email = fields.email.value ?? emailInput;
  const submittedEmail = emailInput.trim().toLowerCase();
  const formAction = submittedEmail
    ? `/reset-password?email=${encodeURIComponent(submittedEmail)}`
    : "/reset-password";
  const showRecoveryLinkSent = Boolean(
    searchParams.get("recoveryLinkSent") === "true" ||
    (actionData && !actionData.result),
  );

  return (
    <>
      <h1 className="mb-2 text-center font-bold text-blue-950">Can't log in</h1>

      {errorMessage && (
        <p className="flex gap-2 rounded bg-amber-100/85 p-4">
          <AlertTriangleIcon className="shrink-0 fill-yellow-500 stroke-white first:stroke-amber-100/85" />
          {errorMessage}
        </p>
      )}

      {!showRecoveryLinkSent ? (
        <>
          <Form action={formAction} method="POST" {...getFormProps(form)}>
            <Field
              inputProps={{
                placeholder: "Enter email",
                onChange: (event) => {
                  setEmailInput(event.currentTarget.value);
                },
                ...getInputProps(fields.email, { type: "email" }),
              }}
              labelProps={{ children: "We'll send a recovery link to" }}
              errors={fields.email.errors}
            />

            <HoneypotInputs />

            <Button
              className="mt-4 w-full"
              type="submit"
              size="lg"
              disabled={isPending}>
              Send recovery link
            </Button>
          </Form>
        </>
      ) : (
        <>
          <img className="mx-auto" src={EmailIllustration} />
          <p className="text-muted-foreground text-sm">
            We sent a recovery link to you at
          </p>
          <p className="font-bold text-blue-950">{email}</p>
          <p className="text-muted-foreground mb-4 text-xs">
            If you haven't received the email, check your spam folder or{" "}
            <Link
              className="text-primary undeline-offset-2 underline transition-transform hover:no-underline focus-visible:no-underline active:translate-y-px"
              to={{
                pathname: "/signup",
                ...(submittedEmail && {
                  search: `?email=${encodeURIComponent(submittedEmail)}`,
                }),
              }}>
              sign up
            </Link>
          </p>
        </>
      )}

      <div className="text-primary flex items-center justify-center gap-2 text-sm font-medium">
        <Link
          className="underline underline-offset-4 transition-transform hover:no-underline focus-visible:no-underline active:translate-y-px"
          to={{
            pathname: "/login",
            search: email ? `?email=${encodeURIComponent(email)}` : "",
          }}>
          Return to log in
        </Link>

        {showRecoveryLinkSent && (
          <>
            <Separator
              className="bg-foreground data-vertical:w-0.5"
              orientation="vertical"
            />

            <Link
              className="underline underline-offset-4 transition-transform hover:no-underline focus-visible:no-underline active:translate-y-px"
              to={{
                pathname: "/reset-password",
                ...(email && {
                  search: `?email=${encodeURIComponent(email)}`,
                }),
              }}>
              Resend recovery link
            </Link>
          </>
        )}
      </div>
    </>
  );
}
