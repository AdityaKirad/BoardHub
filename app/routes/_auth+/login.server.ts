import {
  createMultiSessionCookieName,
  sessionCookie,
  sessionCookieOptions,
} from "~/.server/cookies/session";
import { createCookie, redirect } from "react-router";
import { safeRedirect } from "remix-utils/safe-redirect";
import type {
  SessionSelectType,
  UserSelectType,
} from "~/.server/db/schema/auth";
import { sessionDataStorage } from "~/.server/session/session-data";
import { getExpirationDate } from "~/.server/session";

export async function handleNewSession({
  user,
  session,
  headers,
  redirectTo,
}: {
  session: Pick<SessionSelectType, "token" | "updatedAt" | "expiresAt">;
  user: Pick<UserSelectType, "id" | "name" | "email" | "username" | "photo">;
  headers?: HeadersInit;
  redirectTo: string | null;
}): Promise<never> {
  const sessionData = await sessionDataStorage.getSession();

  sessionData.set("session", {
    session: {
      expiresAt: session.expiresAt.getTime(),
      updatedAt: session.updatedAt.getTime(),
    },
    user,
  });
  sessionData.set("updatedAt", Date.now());
  sessionData.set("expiresAt", getExpirationDate(5 * 60).getTime());

  headers = new Headers(headers);

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
  headers.append(
    "set-cookie",
    await createCookie(
      createMultiSessionCookieName(session.token),
      sessionCookieOptions,
    ).serialize(session.token, {
      expires: session.expiresAt,
    }),
  );

  // eslint-disable-next-line @typescript-eslint/only-throw-error
  throw redirect(safeRedirect(redirectTo, `/${user.username}/boards`), {
    headers,
  });
}
