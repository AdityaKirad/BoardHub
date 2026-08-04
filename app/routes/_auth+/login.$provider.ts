import { providers } from "~/server/oauth";
import type { Route } from "./+types/login.$provider";
import { redirectWithFlash } from "~/server/authentication";

export async function loader({ request, params }: Route.LoaderArgs) {
  const provider = providers[params.provider];

  if (!provider) {
    return redirectWithFlash({ error: "Invalid OAuth Provider" });
  }

  return provider.generateAuth(request);
}
