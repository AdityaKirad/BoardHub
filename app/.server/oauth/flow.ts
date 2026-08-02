/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { generateCodeVerifier, generateState } from "arctic";
import { redirect } from "react-router";
import {
  getRedirectCookieHeader,
  oauthCodeVerifierCookie,
  oauthStateCookie,
} from "~/server/cookies";
import type { OAuthProviderDefinition, Provider } from "./types";

function getRedirectTo(request: Request) {
  return new URL(request.url).searchParams.get("redirectTo");
}

function getCallbackParams(request: Request) {
  const params = new URL(request.url).searchParams;
  return {
    code: params.get("code"),
    state: params.get("state"),
  };
}

async function buildAuthorizationHeaders(
  request: Request,
  definition: OAuthProviderDefinition,
) {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const authUrl = definition
    .buildAuthorizationUrl(state, codeVerifier)
    .toString();

  const headers = new Headers();
  const redirectTo = getRedirectTo(request);

  if (redirectTo) {
    headers.append("set-cookie", await getRedirectCookieHeader(redirectTo));
  }

  headers.append("set-cookie", await oauthStateCookie.serialize(state));
  headers.append(
    "set-cookie",
    await oauthCodeVerifierCookie.serialize(codeVerifier),
  );

  return { authUrl, headers };
}

async function validateCallback(
  request: Request,
  definition: OAuthProviderDefinition,
) {
  const cookieHeader = request.headers.get("cookie");
  const storedState = await oauthStateCookie.parse(cookieHeader);
  const codeVerifier = await oauthCodeVerifierCookie.parse(cookieHeader);
  const { code, state } = getCallbackParams(request);

  if (
    !code ||
    !codeVerifier ||
    !state ||
    !storedState ||
    state !== storedState
  ) {
    return null;
  }

  try {
    const tokens = await definition.exchangeCode(code, codeVerifier as string);
    return definition.fetchProfile(tokens);
  } catch (error) {
    console.error(`[oauth:${definition.name}] callback failed`, error);
    return null;
  }
}

export function defineProvider(definition: OAuthProviderDefinition): Provider {
  return {
    name: definition.name,
    async generateAuth(request) {
      const { authUrl, headers } = await buildAuthorizationHeaders(
        request,
        definition,
      );

      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect(authUrl, { headers });
    },
    handleCallback(request) {
      return validateCallback(request, definition);
    },
  };
}
