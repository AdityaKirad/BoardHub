import { z } from "zod";
import { createEnv } from "@t3-oss/env-core";

export const env = createEnv({
  server: {
    APP_URL: z.string().url(),
    AUTH_SECRET: z.string().length(44),
    DATABASE_URL: z.string().url(),
    DATABASE_AUTH_TOKEN: z.string().optional(),
    DISCORD_CLIENT_ID: z.string(),
    DISCORD_CLIENT_SECRET: z.string(),
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
    HONEYPOT_SEED: z.string().length(44),
    NODE_ENV: z.enum(["development", "production", "test"]),
    PLUNK_SECRET_KEY: z.string(),
  },
  runtimeEnv: process.env,
});
