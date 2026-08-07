import { getUsers } from "~/.server/session";
import type { Route } from "./+types/login_.select-account";
import { data, Form, Link, redirect } from "react-router";
import { AccountsList } from "./+accounts-list";
import { Button } from "~/components/ui/button";
import { LogOutIcon } from "lucide-react";

export const meta: Route.MetaFunction = () => [
  { title: "Log in with BoardHub account" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const { headers, sessions } = await getUsers(request);

  if (!sessions.length) {
    return redirect("/login");
  }

  return data(sessions, { headers });
}

export default function Page({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <h1 className="text-center font-medium text-slate-950">
        Remove accounts from this browser
      </h1>
      <AccountsList accounts={loaderData} action="remove-account" />
      <Form method="POST" action="/logout">
        <Button className="w-full" type="submit" variant="outline">
          <LogOutIcon />
          <p className="flex-1 text-center">Remove all accounts</p>
        </Button>
      </Form>
      <Link
        className="text-primary mt-4 text-center hover:underline focus-visible:underline"
        to="/login/select-account">
        Done
      </Link>
    </>
  );
}
