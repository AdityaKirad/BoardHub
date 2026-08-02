import { env } from "~/env.server";

export const options = {
  httpOnly: true,
  sameSite: "lax",
  secrets: env.AUTH_SECRET.split(", "),
  secure: env.NODE_ENV === "production",
  path: "/",
} as const;
