import { db } from "~/server/db";
import { account, user } from "~/.server/db/schema/auth";
import { createSession } from "~/server/session";
import { generateUsernameSuggestions } from "~/.server/username";
import type { OAuthProfile } from "./types";

export async function linkOAuthAccount(
  request: Request,
  provider: string,
  profile: OAuthProfile,
) {
  const existingAccount = await db.query.account.findFirst({
    columns: { userId: true },
    with: {
      user: {
        columns: { verified: false, createdAt: false, updatedAt: false },
      },
    },
    where: (account, { and, eq }) =>
      and(
        eq(account.provider, provider),
        eq(account.providerId, profile.providerId),
      ),
  });

  if (existingAccount) {
    const [session] = await createSession(request, {
      userId: existingAccount.userId,
    });

    if (!session) {
      throw new Error("Failed to create session");
    }

    return {
      session,
      user: existingAccount.user,
      isNewUser: false,
    };
  }

  const existingUser = await db.query.user.findFirst({
    columns: { verified: false, createdAt: false, updatedAt: false },
    where: (user, { eq }) => eq(user.email, profile.email),
  });

  if (existingUser) {
    return db.transaction(async (tx) => {
      await tx.insert(account).values({
        provider,
        providerId: profile.providerId,
        userId: existingUser.id,
      });

      const [session] = await createSession(request, {
        userId: existingUser.id,
        adapter: tx,
      });

      if (!session) {
        throw new Error("Failed to create session");
      }

      return {
        session,
        user: existingUser,
        isNewUser: false,
      };
    });
  }

  return db.transaction(async (tx) => {
    const [username] = await generateUsernameSuggestions(tx, {
      name: profile.name,
      email: profile.email,
      count: 1,
    });

    const [createdUser] = await tx
      .insert(user)
      .values({
        username: username!,
        name: profile.name,
        email: profile.email,
        verified: profile.verified,
        photo: profile.photo,
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
      provider,
      providerId: profile.providerId,
    });

    const [session] = await createSession(request, {
      userId: createdUser.id,
      adapter: tx,
    });

    if (!session) {
      throw new Error("Failed to create session");
    }

    return {
      session,
      user: createdUser,
      isNewUser: true,
    };
  });
}
