/* eslint-disable @typescript-eslint/only-throw-error */

import { redirect } from "react-router";
import { JWTExpired } from "jose/errors";
import { parseSignedToken } from "~/.server/crypto";
import { signupErrorCodes } from "./signup";

export async function requireVerificationContext(
  request: Request,
  options: {
    scope: "signup" | "setup-account";
    verified?: boolean;
  },
) {
  const signature = new URL(request.url).searchParams.get("signature");

  if (!signature) {
    throw redirect(
      `/login?errorCode=${encodeURIComponent(signupErrorCodes.error)}`,
    );
  }

  try {
    const {
      payload: { scope, verified, sub: email },
    } = await parseSignedToken(signature);

    if (
      !email ||
      scope !== options.scope ||
      (options.verified !== undefined && verified !== options.verified)
    ) {
      throw redirect(
        `/login?errorCode=${encodeURIComponent(signupErrorCodes.error)}`,
      );
    }

    return { email, type: scope as typeof options.scope };
  } catch (error) {
    if (error instanceof JWTExpired) {
      throw redirect(
        `/login?errorCode=${encodeURIComponent(signupErrorCodes.expired)}`,
      );
    }

    throw redirect(
      `/login?errorCode=${encodeURIComponent(signupErrorCodes.error)}`,
    );
  }
}
