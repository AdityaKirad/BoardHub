import { Discord } from "arctic";
import { z } from "zod";
import { env } from "~/env.server";
import { defineProvider } from "../flow";

const schema = z.object({
  id: z.string(),
  avatar: z.string().nullable(),
  email: z.string().email().toLowerCase(),
  global_name: z.string(),
  verified: z.boolean(),
  username: z.string(),
});

const discord = new Discord(
  env.DISCORD_CLIENT_ID,
  env.DISCORD_CLIENT_SECRET,
  `${env.APP_URL}/login/discord/callback`,
);

export const DiscordProvider = defineProvider({
  name: "discord",
  buildAuthorizationUrl(state, codeVerifier) {
    return discord.createAuthorizationURL(state, codeVerifier, [
      "email",
      "identify",
      "openid",
    ]);
  },
  exchangeCode(code, codeVerifier) {
    return discord.validateAuthorizationCode(code, codeVerifier);
  },
  async fetchProfile(tokens) {
    const response = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken()}`,
      },
    });

    if (!response.ok) {
      console.error(
        "[oauth:discord] profile fetch failed",
        response.statusText,
      );
      return null;
    }

    const parsed = schema.safeParse(await response.json());

    if (!parsed.success) {
      console.error("[oauth:discord] invalid profile", parsed.error);
      return null;
    }

    const data = parsed.data;

    return {
      providerId: data.id,
      name: data.global_name ?? data.username,
      email: data.email,
      photo: data.avatar
        ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png?size=512`
        : null,
      verified: data.verified,
    };
  },
});
