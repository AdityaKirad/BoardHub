import { Form, redirect } from "react-router";
import type { Route } from "./+types/signup_.verify-email";
import { getSignedToken } from "~/.server/crypto";
import { z } from "zod";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { Button } from "~/components/ui/button";
import { OTPField } from "~/components/ui/form";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { checkHoneyPot } from "~/.server/honeypot";
import { validateVerificationCode } from "~/.server/authentication";
import { requireVerificationContext } from "./signup.server";

const schema = z.object({
  otp: z.string().length(6),
});

export const meta: Route.MetaFunction = () => [
  { title: "We've emailed you a code - Log in with BoardHub account" },
];

export const loader = ({ request }: Route.LoaderArgs) =>
  requireVerificationContext(request, { scope: "signup" });

export async function action({ request }: Route.ActionArgs) {
  const { email, type } = await requireVerificationContext(request, {
    scope: "signup",
  });

  const formData = await request.formData();

  await checkHoneyPot(formData);

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const isValid = await validateVerificationCode({
    type,
    target: email,
    code: submission.value.otp,
  });

  if (!isValid) {
    return submission.reply({
      fieldErrors: {
        otp: ["Invalid code"],
      },
    });
  }

  const signature = await getSignedToken({
    sub: email,
    verified: true,
    scope: "setup-account",
  });

  const url = new URL(request.url);

  url.pathname = "/signup/welcome";
  url.searchParams.set("signature", signature);

  return redirect(url.toString());
}

export default function Page({ actionData, loaderData }: Route.ComponentProps) {
  const [form, fields] = useForm({
    id: "verify-email",
    lastResult: actionData,
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    constraint: getZodConstraint(schema),
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
  });
  return (
    <>
      <h1 className="text-center text-xl font-bold text-zinc-950">
        We've emailed you a code
      </h1>
      <p className="text-muted-foreground">
        To complete your account setup, enter the code we've sent to:
      </p>
      <h2 className="text-muted-foreground font-bold">{loaderData.email}</h2>
      <Form method="POST" {...getFormProps(form)}>
        <OTPField
          inputProps={getInputProps(fields.otp, { type: "text" })}
          errors={fields.otp.errors}
        />

        <HoneypotInputs />

        <Button type="submit" className="mt-4 w-full" size="lg">
          Verify
        </Button>
      </Form>
    </>
  );
}
