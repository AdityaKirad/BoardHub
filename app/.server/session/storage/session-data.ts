import { createCookieSessionStorage } from "react-router";
import type { UserSelectType } from "~/server/db";
import { env } from "~/env.server";
import { SESSION_CACHE_AGE } from "../config";

export type SessionUser = Pick<
  UserSelectType,
  "id" | "name" | "email" | "username" | "photo"
>;

export const sessionDataStorage = createCookieSessionStorage<{
  session: {
    session: { updatedAt: number; expiresAt: number };
    user: SessionUser;
  };
  updatedAt: number;
  expiresAt: number;
}>({
  cookie: {
    name: "__session_data",
    httpOnly: true,
    maxAge: SESSION_CACHE_AGE,
    path: "/",
    sameSite: "lax",
    secrets: env.AUTH_SECRET.split(", "),
    secure: env.NODE_ENV === "production",
  },
});
