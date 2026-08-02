import { createCookie } from "react-router";
import { env } from "~/env.server";
import { options } from "./options";

export const rememberCookie = createCookie(
  env.NODE_ENV === "production" ? "__Host-remember" : "__remember",
  options,
);
