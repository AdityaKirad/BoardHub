import { createCookieSessionStorage } from "react-router";
import { createThemeSessionResolver } from "remix-themes";
import { env } from "~/env.server";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: env.NODE_ENV === "production" ? "__Host-theme" : "__theme",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secrets: env.AUTH_SECRET.split(", "),
    secure: env.NODE_ENV === "production",
  },
});

export const themeSessionResolver = createThemeSessionResolver(sessionStorage);
