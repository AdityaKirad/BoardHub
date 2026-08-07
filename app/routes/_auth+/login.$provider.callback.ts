import { linkOAuthAccount, providers } from "~/server/oauth";
import type { Route } from "./+types/login.$provider.callback";
import {
  destroyRedirectToHeader,
  getRedirectCookieValue,
  oauthCodeVerifierCookie,
  oauthStateCookie,
} from "~/server/cookies";
import { handleNewSession } from "./login.server";
import { redirect } from "react-router";
import { oauthErrorCodes } from "./login.$provider";

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
    return redirect(
      `/login?errorCode=${encodeURIComponent(oauthErrorCodes.invalidProvider)}`,
      {
        headers,
      },
    );
  }

  const profile = await provider.handleCallback(request);

  if (!profile) {
    return redirect(
      `/login?errorCode=${encodeURIComponent(oauthErrorCodes.signupFailed)}`,
      { headers },
    );
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
