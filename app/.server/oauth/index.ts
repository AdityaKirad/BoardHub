import { DiscordProvider } from "./providers/discord";
import { GithubProvider } from "./providers/github";
import type { Provider } from "./types";

export const providers: Record<string, Provider> = {
  discord: DiscordProvider,
  github: GithubProvider,
};

export * from "./account-linking";
export type * from "./types";
