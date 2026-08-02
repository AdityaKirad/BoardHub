import { createCookieSessionStorage } from "react-router";
import { env } from "~/env.server";

export const flashSessionStorage = createCookieSessionStorage<{
  __flash: string;
}>({
  cookie: {
    name: "__flash",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    secrets: env.AUTH_SECRET.split(", "),
    maxAge: 120,
  },
});
