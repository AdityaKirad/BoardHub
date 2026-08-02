import { createCookie } from "react-router";
import { env } from "~/env.server";
import { options } from "./options";

const redirectCookie = createCookie(
  env.NODE_ENV === "production" ? "__Host-redirect-to" : "__redirect-to",
  {
    ...options,
    maxAge: 60 * 10,
  },
);
export const destroyRedirectToHeader = () =>
  redirectCookie.serialize("", {
    maxAge: -1,
  });

export function getRedirectCookieHeader(redirectTo: string) {
  if (redirectTo === "/") {
    throw new Error("Invalid redirect");
  }
  return redirectCookie.serialize(redirectTo);
}

export function getRedirectCookieValue(request: Request) {
  return redirectCookie.parse(request.headers.get("cookie"));
}
