import { redirect } from "react-router";
import { flashSessionStorage } from "~/server/session/storage/flash";

export async function redirectWithFlash({
  error,
  headers,
  redirectTo,
}: {
  error: string;
  headers?: HeadersInit;
  redirectTo?: string | null;
}) {
  const session = await flashSessionStorage.getSession();

  session.flash("__flash", error);

  headers = new Headers(headers);

  headers.append(
    "set-cookie",
    await flashSessionStorage.commitSession(session),
  );

  redirectTo = redirectTo ? `/login?redirectTo=${redirectTo}` : "/login";

  return redirect(redirectTo, {
    headers,
  });
}
