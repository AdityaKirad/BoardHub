import { createCookie } from "react-router";
import { getHash } from "~/server/crypto/hash";
import { SESSION_EXPIRES_AGE } from "~/server/session/config";
import { options } from "./options";
import { env } from "~/env.server";

export const SESSION_COOKIE_NAME =
  env.NODE_ENV === "production" ? "__Host-session" : "__session";
export const MULTI_SESSION_COOKIE_PREFIX = `${SESSION_COOKIE_NAME}-multi-`;

export const sessionCookieOptions = {
  ...options,
  maxAge: SESSION_EXPIRES_AGE,
} as const;

export const sessionCookie = createCookie(
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
);

export const isMultiSessionCookie = (name: string) =>
  name.includes(MULTI_SESSION_COOKIE_PREFIX);

export const createMultiSessionCookieName = (token: string) =>
  `${MULTI_SESSION_COOKIE_PREFIX}${getHash(token, true).toString().slice(0, 8)}`;
