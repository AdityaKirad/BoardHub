/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { and, eq, gt, inArray } from "drizzle-orm";
import { createCookie } from "react-router";
import { getClientIPAddress } from "remix-utils/get-client-ip-address";
import { generateRandomString } from "~/server/crypto/random-string";
import { parseCookies } from "~/.server/parse-cookies";
import type { DBAdapter } from "~/server/db";
import { db, session, user } from "~/server/db";
import {
  isMultiSessionCookie,
  sessionCookie,
  sessionCookieOptions,
} from "~/server/cookies";
import {
  getExpirationDate,
  SESSION_CACHE_AGE,
  SESSION_EXPIRES_AGE,
  SESSION_UPDATE_AGE,
} from "./config";
import { getIpLocation } from "./metadata";
import { sessionDataStorage } from "./storage/session-data";

export async function createSession(
  request: Request,
  {
    userId,
    adapter,
    remember = true,
  }: { userId: string; adapter?: DBAdapter; remember?: boolean },
) {
  const client = adapter ?? db;

  return client
    .insert(session)
    .values({
      userId,
      location: await getIpLocation(request),
      token: generateRandomString(32),
      userAgent: request.headers.get("user-agent"),
      ipAddress: getClientIPAddress(request),
      expiresAt: remember
        ? getExpirationDate(SESSION_EXPIRES_AGE)
        : getExpirationDate(24 * 60 * 60),
    })
    .returning({
      token: session.token,
      updatedAt: session.updatedAt,
      expiresAt: session.expiresAt,
    });
}

export async function getUsers(request: Request) {
  const cookie = request.headers.get("cookie");

  const cookies = parseCookies(cookie ?? "");

  const headers = new Headers();

  const tokens = (
    await Promise.all(
      Array.from(cookies.keys())
        .filter(isMultiSessionCookie)
        .map(async (key) => {
          const multiSessionCookie = createCookie(key, sessionCookieOptions);
          const token = await multiSessionCookie.parse(cookie);
          if (!token) {
            headers.append(
              "set-cookie",
              await multiSessionCookie.serialize("", { maxAge: -1 }),
            );
          }
          return token;
        }),
    )
  ).filter(Boolean) as string[];

  if (!tokens.length) {
    return { headers, sessions: [] };
  }

  const sessions = await db
    .select({
      token: session.token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        photo: user.photo,
      },
    })
    .from(session)
    .where(
      and(inArray(session.token, tokens), gt(session.expiresAt, new Date())),
    )
    .innerJoin(user, eq(session.userId, user.id));

  return {
    headers,
    sessions,
  };
}

export async function getUser(
  request: Request,
  options?: { getFreshSession?: boolean },
) {
  const cookie = request.headers.get("cookie");

  const sessionToken = await sessionCookie.parse(cookie);

  if (!sessionToken) {
    return { user: null };
  }

  const sessionData = await sessionDataStorage.getSession(cookie);

  const cachedSession = sessionData.get("session");

  const now = Date.now();

  const headers = new Headers();

  if (cachedSession && !options?.getFreshSession) {
    const cachedSessionExpiresAt = sessionData.get("expiresAt")!;
    const hasExpired =
      cachedSession.session.expiresAt < now || cachedSessionExpiresAt < now;

    if (hasExpired) {
      headers.append(
        "set-cookie",
        await sessionDataStorage.destroySession(sessionData),
      );
    } else {
      const timeUntilExpiry = cachedSessionExpiresAt - now;
      const updateAge = 60 * 1000;
      if (timeUntilExpiry < updateAge) {
        const newExpiresAt = getExpirationDate(SESSION_CACHE_AGE).getTime();

        sessionData.set("session", cachedSession);
        sessionData.set("expiresAt", newExpiresAt);
        sessionData.set("updatedAt", now);

        headers.append(
          "set-cookie",
          await sessionDataStorage.commitSession(sessionData),
        );

        return { headers, user: cachedSession.user };
      }

      return { headers, user: cachedSession.user };
    }
  }

  const dbSession = await db.query.session.findFirst({
    columns: { updatedAt: true, expiresAt: true },
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
          username: true,
          photo: true,
        },
      },
    },
    where: (session, { eq }) => eq(session.token, sessionToken),
  });

  if (!dbSession || dbSession.expiresAt < new Date()) {
    headers.append(
      "set-cookie",
      await sessionCookie.serialize("", { maxAge: -1 }),
    );
    if (dbSession) {
      void db
        .delete(session)
        .where(eq(session.token, sessionToken))
        .catch((err) => console.error("Failed to delete session:", err));
    }

    return {
      headers,
    };
  }

  const sessionIsDueToUpdatedDate =
    dbSession.expiresAt.getTime() -
    SESSION_EXPIRES_AGE * 1000 +
    SESSION_UPDATE_AGE * 1000;
  const sessionShouldBeUpdated = sessionIsDueToUpdatedDate <= now;

  if (sessionShouldBeUpdated) {
    const [updatedSession] = await db
      .update(session)
      .set({
        expiresAt: getExpirationDate(SESSION_EXPIRES_AGE),
      })
      .where(eq(session.token, sessionToken))
      .returning({
        token: session.token,
        updatedAt: session.updatedAt,
        expiresAt: session.expiresAt,
      });

    if (!updatedSession) {
      headers.append(
        "set-cookie",
        await sessionCookie.serialize("", { maxAge: -1 }),
      );
      headers.append(
        "set-cookie",
        await sessionDataStorage.destroySession(sessionData),
      );

      return { headers };
    }

    const sessionCacheExpires = getExpirationDate(SESSION_CACHE_AGE);

    sessionData.set("session", {
      session: {
        expiresAt: updatedSession.expiresAt.getTime(),
        updatedAt: updatedSession.updatedAt.getTime(),
      },
      user: dbSession.user,
    });
    sessionData.set("updatedAt", now);
    sessionData.set("expiresAt", sessionCacheExpires.getTime());

    headers.append(
      "set-cookie",
      await sessionCookie.serialize(updatedSession.token, {
        expires: updatedSession.expiresAt,
      }),
    );
    headers.append(
      "set-cookie",
      await sessionDataStorage.commitSession(sessionData, {
        expires: sessionCacheExpires,
      }),
    );

    return { user: dbSession.user, headers };
  }

  const sessionCacheExpires = getExpirationDate(SESSION_CACHE_AGE);

  sessionData.set("session", {
    session: {
      expiresAt: dbSession.expiresAt.getTime(),
      updatedAt: dbSession.updatedAt.getTime(),
    },
    user: dbSession.user,
  });
  sessionData.set("updatedAt", now);
  sessionData.set("expiresAt", sessionCacheExpires.getTime());

  headers.append(
    "set-cookie",
    await sessionDataStorage.commitSession(sessionData, {
      expires: sessionCacheExpires,
    }),
  );

  return {
    headers,
    user: dbSession.user,
  };
}
