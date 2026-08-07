import { getUsers, requireUser } from "~/.server/session";
import type { Route } from "./+types/logout";
import { session } from "~/.server/db/schema/auth";
import { db } from "~/.server/db";
import { inArray } from "drizzle-orm";
import { createCookie, data, Form, redirect } from "react-router";
import { isMultiSessionCookie, sessionCookieOptions } from "~/.server/cookies";
import { parseCookies } from "~/.server/parse-cookies";
import { sessionDataStorage } from "~/.server/session/session-data";

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
  await requireUser(request);

  const cookieHeader = request.headers.get("cookie");

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
  return (
    <>
      <h1>Log out of your BoardHub account{areMultipleSessions ? "s" : ""}</h1>
      <Form method="POST" action={`/logout/${sessions[0]?.token}`}></Form>
    </>
  );
}
