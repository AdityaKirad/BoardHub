import {
  getExpirationDate,
  requireUser,
  SESSION_CACHE_AGE,
} from "~/.server/session";
import type { Route } from "./+types/logout.$token";
import {
  createMultiSessionCookieName,
  isMultiSessionCookie,
  sessionCookie,
  sessionCookieOptions,
} from "~/.server/cookies";
import { createCookie, redirect } from "react-router";
import { db } from "~/.server/db";
import { session } from "~/.server/db/schema/auth";
import { eq } from "drizzle-orm";
import { parseCookies } from "~/.server/parse-cookies";
import { sessionDataStorage } from "~/.server/session/session-data";

export async function action({ request, params }: Route.ActionArgs) {
  await requireUser(request);

  const cookieHeader = request.headers.get("cookie");

  const multiSessionCookie = createCookie(
    createMultiSessionCookieName(params.token),
    sessionCookieOptions,
  );

  const token = (await multiSessionCookie.parse(cookieHeader)) as string | null;

  if (!token) {
    return redirect("/login", {
      headers: {
        "set-cookie": await multiSessionCookie.serialize("", { maxAge: -1 }),
      },
    });
  }

  await db.delete(session).where(eq(session.token, token));

  const headers = new Headers();

  headers.append(
    "set-cookie",
    await multiSessionCookie.serialize("", { maxAge: -1 }),
  );

  const cookies = parseCookies(cookieHeader ?? "");

  const tokens = (
    await Promise.all(
      Array.from(cookies.keys())
        .filter(isMultiSessionCookie)
        .map((key) =>
          createCookie(key, sessionCookieOptions).parse(cookieHeader),
        ),
    )
  ).filter((v) => typeof v === "string");

  if (tokens.length) {
    const session = await db.query.session.findFirst({
      columns: { token: true, updatedAt: true, expiresAt: true },
      with: {
        user: {
          columns: { verified: false, createdAt: false, updatedAt: false },
        },
      },
      where: (session, { and, gt, inArray }) =>
        and(inArray(session.token, tokens), gt(session.expiresAt, new Date())),
      orderBy: (session, { desc }) => desc(session.updatedAt),
    });

    if (session) {
      const expires = getExpirationDate(SESSION_CACHE_AGE);
      const sessionData = await sessionDataStorage.getSession();

      sessionData.set("session", {
        user: session.user,
        session: {
          updatedAt: session.updatedAt.getTime(),
          expiresAt: session.expiresAt.getTime(),
        },
      });
      sessionData.set("updatedAt", new Date().getTime());
      sessionData.set("expiresAt", expires.getTime());

      headers.append(
        "set-cookie",
        await sessionCookie.serialize(session.token, {
          expires: session.expiresAt,
        }),
      );
      headers.append(
        "set-cookie",
        await sessionDataStorage.commitSession(sessionData, { expires }),
      );

      return redirect(`/${session.user.username}/boards`, {
        headers,
      });
    } else {
      await clearSessionCookie(headers);
    }
  } else {
    await clearSessionCookie(headers);
  }

  return redirect("/login", {
    headers,
  });
}

const clearSessionCookie = async (headers: Headers) =>
  headers.append(
    "set-cookie",
    await sessionCookie.serialize("", { maxAge: -1 }),
  );
