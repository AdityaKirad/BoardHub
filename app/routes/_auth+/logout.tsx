import { getUsers } from "~/.server/session";
import type { Route } from "./+types/logout";
import { session } from "~/.server/db/schema/auth";
import { db } from "~/.server/db";
import { inArray } from "drizzle-orm";
import { createCookie, data, Form, Link, redirect } from "react-router";
import {
  isMultiSessionCookie,
  sessionCookie,
  sessionCookieOptions,
} from "~/.server/cookies";
import { parseCookies } from "~/.server/parse-cookies";
import { sessionDataStorage } from "~/.server/session/session-data";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { getInitials } from "~/lib/utils";
import { Button } from "~/components/ui/button";

export const meta: Route.MetaFunction = () => [
  {
    title: "Log out of your BoardHub account - Log in with BoardHub account",
  },
];

export async function loader({ request }: Route.LoaderArgs) {
  const { sessions, headers } = await getUsers(request);

  if (!sessions.length) {
    return redirect("/login", {
      headers,
    });
  }

  return data({ sessions }, { headers });
}

export async function action({ request }: Route.ActionArgs) {
  const cookieHeader = request.headers.get("cookie");

  const token = (await sessionCookie.parse(cookieHeader)) as string;

  const { sessions, headers: usersHeaders } = await getUsers(request);

  if (!sessions.find((session) => session.token === token)) {
    return redirect("/login", {
      headers: usersHeaders,
    });
  }

  const headers = new Headers();

  const cookies = parseCookies(cookieHeader ?? "");

  const verifiedTokens = (
    await Promise.all(
      Array.from(cookies.keys())
        .filter(isMultiSessionCookie)
        .map(async (key) => {
          const multiSessionCookie = createCookie(key, sessionCookieOptions);

          const token = (await multiSessionCookie.parse(cookieHeader)) as
            string | null;

          if (token) {
            headers.append(
              "set-cookie",
              await multiSessionCookie.serialize("", { maxAge: -1 }),
            );
          }

          return token;
        }),
    )
  ).filter((v) => typeof v === "string");

  if (verifiedTokens.length) {
    await db.delete(session).where(inArray(session.token, verifiedTokens));
  }

  const sessionData = await sessionDataStorage.getSession(cookieHeader);

  headers.append(
    "set-cookie",
    await sessionDataStorage.destroySession(sessionData),
  );

  return redirect("/login", {
    headers,
  });
}

export default function Page({
  loaderData: { sessions },
}: Route.ComponentProps) {
  const areMultipleSessions = sessions.length > 1;
  const user = sessions[0]?.user;
  return (
    <>
      <h1 className="text-center font-bold">
        Log out of your BoardHub account{areMultipleSessions ? "s" : ""}
      </h1>
      {user && (
        <div className="flex items-center gap-4">
          <Avatar className="size-20">
            <AvatarImage src={user.photo ?? ""} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold text-zinc-950">{user.name}</p>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
      )}
      <Form
        method="POST"
        action={
          areMultipleSessions ? "/logout" : `/logout/${sessions[0]?.token}`
        }>
        <Button className="w-full" type="submit">
          {areMultipleSessions ? "Log out of all accounts" : "Log out"}
        </Button>
      </Form>
      <Button variant="link" asChild>
        <Link to="/login/select-account">Log in to another account</Link>
      </Button>
    </>
  );
}
