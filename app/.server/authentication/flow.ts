import { createCookie } from "react-router";
import { isMultiSessionCookie, sessionCookieOptions } from "~/server/cookies";
import { db } from "~/server/db";
import {
  account,
  user,
  type SessionSelectType,
  type UserInsertType,
  type UserSelectType,
} from "~/.server/db/schema/auth";
import { parseCookies } from "~/.server/parse-cookies";
import { createSession, MAX_SESSIONS } from "~/server/session";
import { generateUsernameSuggestions } from "~/.server/username";
import { getPasswordHash, verifyPassword } from "./password";
import { and, eq } from "drizzle-orm";

export const CREDENTIAL_PROVIDER_KEY = "credential";

export async function login(
  request: Request,
  {
    email,
    password,
    remember,
  }: {
    email: string;
    password: string;
    remember: boolean;
  },
): Promise<
  | { headers: HeadersInit; sessionCapReached: true; username: string }
  | {
      headers: HeadersInit;
      session: Pick<SessionSelectType, "token" | "updatedAt" | "expiresAt">;
      user: Pick<
        UserSelectType,
        "id" | "name" | "email" | "username" | "photo"
      >;
      sessionCapReached?: never;
    }
  | null
> {
  const [dbUser] = await db
    .select({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        photo: user.photo,
      },
      password: account.password,
    })
    .from(user)
    .innerJoin(account, eq(account.userId, user.id))
    .where(
      and(eq(user.email, email), eq(account.provider, CREDENTIAL_PROVIDER_KEY)),
    )
    .limit(1);

  if (!dbUser?.password) {
    await getPasswordHash(password);
    return null;
  }

  const isValid = await verifyPassword({
    password,
    hash: dbUser.password,
  });

  if (!isValid) {
    return null;
  }

  const cookie = request.headers.get("cookie");

  const cookies = parseCookies(cookie ?? "");

  const headers = new Headers();

  const parsedCookies = (
    await Promise.all(
      Array.from(cookies.keys())
        .filter(isMultiSessionCookie)
        .map(async (key) => {
          const multiSessionCookie = createCookie(key, sessionCookieOptions);
          const token = (await multiSessionCookie.parse(cookie)) as string;
          if (!token) {
            headers.append(
              "set-cookie",
              await multiSessionCookie.serialize(null, { maxAge: -1 }),
            );
            return null;
          }
          return { token, cookie: multiSessionCookie };
        }),
    )
  ).filter((value) => value !== null);

  if (!parsedCookies.length) {
    const [session] = await createSession(request, {
      remember,
      userId: dbUser.user.id,
    });

    if (!session) {
      throw new Error("Failed to create session");
    }

    return { headers, session, user: dbUser.user };
  }

  const sessions = await db.query.session.findMany({
    columns: { token: true, userId: true, updatedAt: true, expiresAt: true },
    where: (session, { and, inArray, gt }) =>
      and(
        inArray(
          session.token,
          parsedCookies.map(({ token }) => token),
        ),
        gt(session.expiresAt, new Date()),
      ),
  });

  const validTokens = new Set<string>();
  let existingSession: (typeof sessions)[number] | undefined;

  for (const session of sessions) {
    validTokens.add(session.token);

    if (session.userId === dbUser.user.id) {
      existingSession = session;
    }
  }

  for (const { cookie, token } of parsedCookies) {
    if (!validTokens.has(token)) {
      headers.append(
        "set-cookie",
        await cookie.serialize(null, { maxAge: -1 }),
      );
    }
  }

  if (existingSession) {
    return { headers, user: dbUser.user, session: existingSession };
  }

  if (sessions.length >= MAX_SESSIONS) {
    return {
      headers,
      sessionCapReached: true,
      username: dbUser.user.username,
    };
  }

  const [session] = await createSession(request, {
    userId: dbUser.user.id,
  });

  if (!session) {
    throw new Error("Failed to create session");
  }

  return { headers, session, user: dbUser.user };
}

export const signup = (
  request: Request,
  {
    password,
    userInfo,
  }: {
    password: string;
    userInfo: Pick<UserInsertType, "name" | "email" | "verified">;
  },
) =>
  db.transaction(async (tx) => {
    const [username] = await generateUsernameSuggestions(tx, {
      name: userInfo.name,
      email: userInfo.email,
      count: 1,
    });

    const [createdUser] = await tx
      .insert(user)
      .values({
        username: username!,
        ...userInfo,
      })
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        photo: user.photo,
      });

    if (!createdUser) {
      throw new Error("Failed to create user");
    }

    await tx.insert(account).values({
      userId: createdUser.id,
      provider: CREDENTIAL_PROVIDER_KEY,
      providerId: createdUser.id,
      password: await getPasswordHash(password),
    });

    const [createdSession] = await createSession(request, {
      adapter: tx,
      userId: createdUser.id,
    });

    if (!createdSession) {
      throw new Error("Failed to create session");
    }

    return { user: createdUser, session: createdSession };
  });

export async function resetPassword({
  userId,
  password,
}: {
  userId: string;
  password: string;
}) {
  const passwordHash = await getPasswordHash(password);

  return db
    .insert(account)
    .values({
      userId,
      password: passwordHash,
      provider: CREDENTIAL_PROVIDER_KEY,
      providerId: userId,
    })
    .onConflictDoUpdate({
      set: {
        password: passwordHash,
      },
      target: [account.provider, account.providerId],
    });
}
