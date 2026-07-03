import { Form, Link, useSearchParams } from "react-router";
import { z } from "zod";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Field } from "~/components/ui/form";
import type { Route } from "./+types/_auth-layout.login";
import { useIsPending } from "~/hooks/use-is-pending";
import { Button } from "~/components/ui/button";
import { DiscordIcon } from "~/components/icons/discord";
import { GithubIcon } from "~/components/icons/github";
import { AlertCircleIcon, DotIcon } from "lucide-react";
import { checkHoneyPot } from "~/.server/honeypot";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { Label } from "~/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

const schema = z.object({
  email: z.string().email(),
  password: z.string(),
  remember: z.boolean().default(false),
});

export const meta: Route.MetaFunction = () => [
  { title: "Log in to continue - Log in with Trellix account" },
];

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  checkHoneyPot(formData);

  const submission = parseWithZod(formData, { schema });

  if (submission.status === "error") {
    return submission.reply();
  }

  return submission.reply();
}

export default function Page({ actionData }: Route.ComponentProps) {
  const isPending = useIsPending();
  const [searchParams] = useSearchParams();
  const [form, fields] = useForm({
    id: "login",
    constraint: getZodConstraint(schema),
    lastResult: actionData,
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
  });
  return (
    <>
      <h1 className="text-center text-lg font-bold text-blue-950">
        Log in to continue.
      </h1>

      {searchParams.get("info_code") === "existing_user" && (
        <p className="text-muted-foreground text-center text-sm">
          It looks like you've already got an account associated with this
          email. Log in instead or reset your password if you've forgotten it
        </p>
      )}

      <Form className="flex flex-col gap-2" {...getFormProps(form)}>
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

        <Button type="submit" disabled={!form.valid || isPending}>
          Log in
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
              pathname: "reset-password",
              search: fields.email.value
                ? `?email=${encodeURIComponent(fields.email.value)}`
                : "",
            }}
          >
            Can't log in?
          </Link>
        </Button>
        <DotIcon className="max-sm:hidden" />
        <Button className="p-0 text-blue-500" variant="link" as-child>
          <Link
            to={{
              pathname: "signup",
              search: fields.email.value
                ? `?email=${encodeURIComponent(fields.email.value)}`
                : "",
            }}
          >
            Create an account
          </Link>
        </Button>
      </div>
    </>
  );
}
