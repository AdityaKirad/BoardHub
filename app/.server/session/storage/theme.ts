import { createCookieSessionStorage } from "react-router";
import { createThemeSessionResolver } from "remix-themes";
import { env } from "~/env.server";
import { options } from "~/.server/cookies";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: env.NODE_ENV === "production" ? "__Host-theme" : "__theme",
    ...options,
  },
});

export const themeSessionResolver = createThemeSessionResolver(sessionStorage);
