import { checkHoneyPot } from "~/.server/honeypot";
import type { Route } from "./+types/_auth-layout.signup";
import { z } from "zod";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { Form, Link, useSearchParams } from "react-router";
import { AlertTriangleIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { useState } from "react";
import { Field } from "~/components/ui/form";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { useIsPending } from "~/hooks/use-is-pending";
import { DiscordIcon } from "~/components/icons/discord";
import { GithubIcon } from "~/components/icons/github";

const schema = z.object({
  email: z.string().email(),
});

const errorMap: Record<string, { message: string }> = {
  expired_token: {
    message:
      "Your email verification attempt has expired. Enter your email address and try again.",
  },
  invalid_token: {
    message:
      "Something went wrong while verifying your email address. Enter your email address and try again.",
  },
};

export const meta: Route.MetaFunction = () => [
  {
    title: "Sign up - Log in with Trellix account",
  },
];

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  checkHoneyPot(formData);

  const submission = parseWithZod(formData, { schema });

  if (submission.status === "error") {
    return { result: submission.reply() };
  }

  return { verificationLinkSent: false };
}

export default function Page({ actionData }: Route.ComponentProps) {
  const [verificationLinkSent, verificationLinkSentSet] = useState(
    actionData?.verificationLinkSent ?? false,
  );
  const [searchParams] = useSearchParams();
  const [form, fields] = useForm({
    id: "signup",
    constraint: getZodConstraint(schema),
    lastResult: actionData?.result,
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
  });

  const isPending = useIsPending();

  const errorCode = searchParams.get("error_code");
  const currentError = errorCode ? errorMap[errorCode].message : "";
  return (
    <>
      <h1 className="text-center text-lg font-bold text-blue-950">
        Sign up to continue.
      </h1>

      {currentError && (
        <div
          v-if="currentError"
          className="flex gap-2 rounded-sm bg-yellow-200/50 px-4 py-6 text-sm"
        >
          <AlertTriangleIcon className="shrink-0 fill-amber-500 stroke-yellow-200" />
          {currentError}
        </div>
      )}

      {verificationLinkSent ? (
        <>
          <img
            className="mx-auto"
            src="email-illustration.webp"
            height="200"
            width="200"
            decoding="async"
            loading="lazy"
          />
          <p className="text-muted-foreground">
            We have sent a verification link to you at
          </p>
          <p className="font-medium text-blue-950">{fields.email.value}</p>
          <p className="text-muted-foreground text-sm">
            If you haven't received the email, check your spam folder or
            <Link
              className="text-blue-500 underline-offset-4 hover:underline focus-visible:underline"
              to={{
                pathname: "signup",
                search: `?email=${fields.email.value}`,
              }}
            >
              sign up
            </Link>
          </p>
          <div className="flex justify-center gap-2">
            <Button className="h-fit p-0" variant="link" asChild>
              <Link
                to={{
                  pathname: "login",
                  search: `?email=${fields.email.value}`,
                }}
              >
                Return to log in
              </Link>
            </Button>
            {/* <hr className="bg-foreground w-px" > */}
            <Separator orientation="vertical" />
            <Button
              className="h-fit p-0"
              variant="link"
              onClick={() => verificationLinkSentSet(false)}
            >
              Resend recovery link
            </Button>
          </div>
        </>
      ) : (
        <>
          <Form className="space-y-2" {...getFormProps(form)}>
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
              type="submit"
              className="w-full"
              disabled={!form.valid || isPending}
            >
              {" "}
              Create Account{" "}
            </Button>
          </Form>

          <p className="text-muted-foreground text-center text-sm font-semibold">
            Or continue with:
          </p>

          <Button variant="outline" asChild>
            <a href="/login/discord">
              <DiscordIcon />
              Discord
            </a>
          </Button>

          <Button variant="outline" asChild>
            <a href="/login/github">
              <GithubIcon />
              GitHub
            </a>
          </Button>

          <div className="flex items-center justify-center gap-2">
            <Button className="p-0 text-blue-500" variant="link" asChild>
              <Link
                to={{
                  pathname: "login",
                  search: fields.email.value
                    ? `?email=${encodeURIComponent(fields.email.value)}`
                    : "",
                }}
              >
                Already have an Trellix account? Log in
              </Link>
            </Button>
          </div>
        </>
      )}
    </>
  );
}
