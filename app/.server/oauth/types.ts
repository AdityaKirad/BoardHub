import type { OAuth2Tokens } from "arctic";

export interface OAuthProfile {
  providerId: string;
  name: string;
  email: string;
  photo: string | null;
  verified: boolean;
}

export interface OAuthProviderDefinition {
  name: string;
  buildAuthorizationUrl: (state: string, codeVerifier: string) => URL;
  exchangeCode: (code: string, codeVerifier: string) => Promise<OAuth2Tokens>;
  fetchProfile: (tokens: OAuth2Tokens) => Promise<OAuthProfile | null>;
}

export interface Provider {
  name: string;
  generateAuth: (request: Request) => Promise<never>;
  handleCallback: (request: Request) => Promise<OAuthProfile | null>;
}
