import { Form, Link, redirect, useSearchParams } from "react-router";
import { z } from "zod";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Field } from "~/components/ui/form";
import type { Route } from "./+types/login";
import { useIsPending } from "~/hooks/use-is-pending";
import { Button } from "~/components/ui/button";
import { DiscordIcon } from "~/components/icons/discord";
import { GithubIcon } from "~/components/icons/github";
import { AlertCircleIcon, AlertTriangleIcon, DotIcon } from "lucide-react";
import { checkHoneyPot } from "~/.server/honeypot";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { Label } from "~/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { login } from "~/.server/authentication";
import { handleNewSession } from "./login.server";
import { signupErrorCodes } from "./signup";
import { Spinner } from "~/components/ui/spinner";

const schema = z.object({
  email: z.string().email(),
  password: z.string(),
  remember: z.boolean().default(false),
});

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms * Math.random()));

const error: Record<string, string> = {
  [signupErrorCodes.error]:
    "Something went wrong while verifying your email address. Enter your email address and try again.",
  [signupErrorCodes.expired]:
    "Your email verification attempt has expired. Enter your email address and try again.",
};

export const meta: Route.MetaFunction = () => [
  { title: "Log in to continue - Log in with BoardHub account" },
];

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  await checkHoneyPot(formData);

  const submission = await parseWithZod(formData, {
    schema: (intent) =>
      schema.transform(async (data, ctx) => {
        if (intent !== null) {
          return { ...data, session: null };
        }

        const session = await login(request, data);

        if (!session) {
          ctx.addIssue({
            code: "custom",
            message: "Invalid credentials",
          });

          return z.NEVER;
        }

        return { ...data, session };
      }),
    async: true,
  });

  if (submission.status !== "success" || !submission.value.session) {
    return submission.reply();
  }

  const { session } = submission.value;

  if (session.sessionCapReached) {
    return redirect(`/${session.username}/boards`);
  }

  const url = new URL(request.url);

  await sleep(3000);

  return handleNewSession({
    ...session,
    redirectTo: url.searchParams.get("redirectTo"),
  });
}

export default function Page({ actionData }: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const [form, fields] = useForm({
    id: "login",
    defaultValue: {
      email: searchParams.get("email"),
    },
    constraint: getZodConstraint(schema),
    lastResult: actionData,
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
  });
  const isPending = useIsPending();

  const errorMessage = error[searchParams.get("errorCode")!];
  return (
    <>
      <h1 className="text-center font-bold text-blue-950">
        Log in to continue.
      </h1>

      {errorMessage && (
        <p className="flex gap-2 rounded bg-amber-100/85 p-4">
          <AlertTriangleIcon className="shrink-0 fill-yellow-500 stroke-white first:stroke-amber-100/85" />
          {errorMessage}
        </p>
      )}

      {searchParams.get("infoCode") === "existingUserSignupAttempt" && (
        <p className="text-muted-foreground text-center text-sm">
          It looks like you've already got an account associated with this
          email. Log in instead or reset your password if you've forgotten it
        </p>
      )}

      <Form
        className="flex flex-col gap-2"
        method="POST"
        {...getFormProps(form)}>
        <Field
          inputProps={{
            ...getInputProps(fields.email, { type: "email" }),
            placeholder: "Enter your email",
          }}
          labelProps={{ children: "Email" }}
          errors={fields.email.errors}
        />
        <Field
          inputProps={{
            ...getInputProps(fields.password, { type: "password" }),
            placeholder: "Enter your password",
          }}
          labelProps={{ children: "Password" }}
          errors={fields.password.errors}
        />

        <div className="flex items-center gap-2">
          <input {...getInputProps(fields.remember, { type: "checkbox" })} />
          <Label htmlFor={fields.remember.id}>Remember me</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertCircleIcon className="rotate-180 fill-purple-500 stroke-white" />
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>
                  We remember your account information for the next time you log
                  in.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <HoneypotInputs />

        <Button className="mt-4" type="submit" size="lg" disabled={isPending}>
          {isPending ? <Spinner /> : "Log in"}
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

      <div className="flex items-center justify-center gap-2 max-sm:flex-col">
        <Button className="p-0 text-blue-500" variant="link" asChild>
          <Link
            to={{
              pathname: "/reset-password",
              search: fields.email.value
                ? `?email=${encodeURIComponent(fields.email.value)}`
                : "",
            }}>
            Can't log in?
          </Link>
        </Button>
        <DotIcon className="max-sm:hidden" />
        <Button className="p-0 text-blue-500" variant="link" asChild>
          <Link
            to={{
              pathname: "/signup",
              search: fields.email.value
                ? `?email=${encodeURIComponent(fields.email.value)}`
                : "",
            }}>
            Create an account
          </Link>
        </Button>
      </div>
    </>
  );
}
