import { OAuth2Client, CodeChallengeMethod } from "arctic";
import { z } from "zod";
import { env } from "~/env.server";
import { defineProvider } from "../flow";

const schema = z.object({
  id: z.coerce.string(),
  name: z.string(),
  email: z.string().email().toLowerCase(),
  avatar_url: z.string().url(),
});

const github = new OAuth2Client(
  env.GITHUB_CLIENT_ID,
  env.GITHUB_CLIENT_SECRET,
  `${env.APP_URL}/login/github/callback`,
);

export const GithubProvider = defineProvider({
  name: "github",
  buildAuthorizationUrl(state, codeVerifier) {
    return github.createAuthorizationURLWithPKCE(
      "https://github.com/login/oauth/authorize",
      state,
      CodeChallengeMethod.S256,
      codeVerifier,
      ["user:email"],
    );
  },
  exchangeCode(code, codeVerifier) {
    return github.validateAuthorizationCode(
      "https://github.com/login/oauth/access_token",
      code,
      codeVerifier,
    );
  },
  async fetchProfile(tokens) {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken()}`,
      },
    });

    if (!response.ok) {
      console.error("[oauth:github] profile fetch failed", response.statusText);
      return null;
    }

    const parsed = schema.safeParse(await response.json());

    if (!parsed.success) {
      console.error("[oauth:github] invalid profile", parsed.error);
      return null;
    }

    const data = parsed.data;

    return {
      providerId: data.id,
      name: data.name,
      email: data.email,
      verified: false,
      photo: data.avatar_url,
    };
  },
});
