import { linkOAuthAccount, providers } from "~/server/oauth";
import type { Route } from "./+types/login.$provider.callback";
import { redirectWithFlash } from "~/server/authentication";
import {
  destroyRedirectToHeader,
  getRedirectCookieValue,
  oauthCodeVerifierCookie,
  oauthStateCookie,
} from "~/server/cookies";
import { handleNewSession } from "./login.server";

export async function loader({ request, params }: Route.LoaderArgs) {
  const provider = providers[params.provider];

  const headers = new Headers();

  headers.append(
    "set-cookie",
    await oauthCodeVerifierCookie.serialize("", { maxAge: -1 }),
  );
  headers.append(
    "set-cookie",
    await oauthStateCookie.serialize("", { maxAge: -1 }),
  );

  if (!provider) {
    return redirectWithFlash({ headers, error: "Invalid OAuth Provider" });
  }

  const profile = await provider.handleCallback(request);

  if (!profile) {
    return redirectWithFlash({ headers, error: "OAuth sign-in failed" });
  }

  const { session, user } = await linkOAuthAccount(
    request,
    provider.name,
    profile,
  );

  const redirectTo = (await getRedirectCookieValue(request)) as string | null;

  headers.append("set-cookie", await destroyRedirectToHeader());

  return handleNewSession({
    redirectTo,
    user,
    session,
    headers,
  });
}
