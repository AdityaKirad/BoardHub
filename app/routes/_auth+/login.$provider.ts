import { providers } from "~/server/oauth";
import type { Route } from "./+types/login.$provider";
import { redirect } from "react-router";

export const oauthErrorCodes = {
  invalidProvider: "invalid.oauth.provider",
  signupFailed: "oauth.signup.failed",
};

export async function action({ request, params }: Route.ActionArgs) {
  const provider = providers[params.provider];

  if (!provider) {
    return redirect(
      `/login?errorCode=${encodeURIComponent(oauthErrorCodes.invalidProvider)}`,
    );
  }

  return provider.generateAuth(request);
}
