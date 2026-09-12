import { redirect } from "react-router";
import { getUser } from "./service";

export async function requireAnonymous(request: Request) {
  const { user } = await getUser(request);

  if (user) {
    return redirect(`/${user.username}/boards`);
  }
}

export async function requireUser(
  request: Request,
  options?: { getFreshSession?: boolean },
) {
  const { user, headers } = await getUser(request, options);

  if (!user) {
    const url = new URL(request.url);
    url.searchParams.set("redirectTo", url.pathname + url.search);
    url.pathname = "/login";
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw redirect(url.toString(), {
      headers,
    });
  }

  return user;
}
