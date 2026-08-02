import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { env } from "~/env.server";
import { getExpirationDate } from "../session";

const secret = new TextEncoder().encode(env.AUTH_SECRET);

export function getSignedToken(data: JWTPayload) {
  return new SignJWT({
    iss: "BoardHub",
    iat: Math.floor(new Date().getTime() / 1000),
    exp: Math.floor(getExpirationDate().getTime() / 1000),
    jti: crypto.randomUUID(),
    ...data,
  })
    .setProtectedHeader({ alg: "HS256" })
    .sign(secret);
}

export function parseSignedToken(token: string) {
  return jwtVerify(token, secret, {
    algorithms: ["HS256"],
    issuer: "BoardHub",
  });
}
