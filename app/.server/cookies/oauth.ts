import { createCookie } from "react-router";
import { options } from "./options";
import { env } from "~/env.server";

const oauthOptions = {
  ...options,
  maxAge: 60 * 10,
} as const;

export const oauthCodeVerifierCookie = createCookie(
  env.NODE_ENV === "production"
    ? "__Host-oauth_code_verifier"
    : "__oauth_code_verifier",
  oauthOptions,
);
export const oauthStateCookie = createCookie(
  env.NODE_ENV === "production"
    ? "__Host-oauth_state_cookie"
    : "__oauth_state_cookie",
  oauthOptions,
);
