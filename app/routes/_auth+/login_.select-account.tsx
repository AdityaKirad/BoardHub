import { getExpirationDate, getUsers, requireUser } from "~/.server/session";
import type { Route } from "./+types/login_.select-account";
import { createCookie, data, Link, redirect } from "react-router";
import { Button } from "~/components/ui/button";
import { UserCircleIcon, XCircleIcon } from "lucide-react";
import {
  createMultiSessionCookieId,
  MULTI_SESSION_COOKIE_PREFIX,
  sessionCookie,
  sessionCookieOptions,
} from "~/.server/cookies";
import { db } from "~/.server/db";
import { sessionDataStorage } from "~/.server/session/storage/session-data";
import { AccountsList } from "./+accounts-list";

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

export async function action({ request }: Route.ActionArgs) {
  await requireUser(request);

  const formData = await request.formData();

  const sessionToken = formData.get("session_token");

  if (typeof sessionToken !== "string") {
    return;
  }

  const cookie = (await createCookie(
    `${MULTI_SESSION_COOKIE_PREFIX}${createMultiSessionCookieId(sessionToken)}`,
    sessionCookieOptions,
  ).parse(request.headers.get("cookie"))) as string;

  if (!cookie) {
    return;
  }

  const session = await db.query.session.findFirst({
    columns: { token: true, updatedAt: true, expiresAt: true },
    with: {
      user: {
        columns: { verified: false, createdAt: false, updatedAt: false },
      },
    },
    where: (session, { and, eq, gt }) =>
      and(eq(session.token, cookie), gt(session.expiresAt, new Date())),
  });

  if (!session) {
    return;
  }

  const sessionData = await sessionDataStorage.getSession();

  sessionData.set("session", {
    user: session.user,
    session: {
      expiresAt: session.expiresAt.getTime(),
      updatedAt: session.updatedAt.getTime(),
    },
  });
  sessionData.set("updatedAt", Date.now());
  sessionData.set("expiresAt", getExpirationDate(5 * 60).getTime());

  const headers = new Headers();

  headers.append(
    "set-cookie",
    await sessionCookie.serialize(session.token, {
      expires: session.expiresAt,
    }),
  );
  headers.append(
    "set-cookie",
    await sessionDataStorage.commitSession(sessionData),
  );

  return redirect(`/${session.user.username}/boards`, { headers });
}

export default function Page({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <h1 className="text-center font-medium text-slate-950">
        Choose or add another account
      </h1>
      <AccountsList accounts={loaderData} />
      <Button variant="outline" asChild>
        <Link to="/login">
          <UserCircleIcon />
          <p className="flex-1 text-center">Add another account</p>
        </Link>
      </Button>
      <Button variant="outline" asChild>
        <Link to="/login/remove-account">
          <XCircleIcon />
          <p className="flex-1 text-center">Remove account from this browser</p>
        </Link>
      </Button>
    </>
  );
}
