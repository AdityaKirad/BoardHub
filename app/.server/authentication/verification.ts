import crypto from "crypto";
import { eq } from "drizzle-orm";
import { generateRandomString } from "~/server/crypto/random-string";
import { getHash } from "~/server/crypto/hash";
import { db } from "~/server/db";
import { verification } from "~/.server/db/schema/auth";
import { getExpirationDate } from "~/server/session/config";

export async function createVerification({
  target,
  type,
}: {
  target: string;
  type: "password-reset" | "signup";
}) {
  const identifier = `${type}-${target}`;
  const expiresAt = getExpirationDate();

  let code: string | undefined;
  let jti: string | undefined;
  let value: string;

  if (type === "signup") {
    code = generateRandomString(6, {
      alphabet: ["0-9", "A-Z"],
      omit: ["0", "1", "2", "5", "6", "8", "B", "G", "I", "O", "S", "Z"],
    });

    value = `${getHash(code, true)}:0`;
  } else {
    jti = crypto.randomUUID();
    value = getHash(jti, true);
  }

  try {
    await db
      .insert(verification)
      .values({
        identifier,
        value,
        expiresAt,
      })
      .onConflictDoUpdate({
        target: [verification.identifier],
        set: {
          value,
          expiresAt,
        },
      });
  } catch (error) {
    console.error(error);
    return null;
  }

  return {
    expiresAt,
    value: type === "signup" ? code! : jti!,
  };
}

export async function validateVerificationCode({
  code,
  target,
  type,
}: {
  code: string;
  target: string;
  type: string;
}) {
  const identifier = `${type}-${target}`;

  const verificationData = await db.query.verification.findFirst({
    columns: { value: true },
    where: (entry, { and, eq, gt }) =>
      and(eq(entry.identifier, identifier), gt(entry.expiresAt, new Date())),
  });

  if (!verificationData) {
    return false;
  }

  const [codeValue, attempts] = verificationData.value.split(":");

  if (!codeValue || (type === "signup" && !attempts)) {
    return false;
  }

  if (type === "signup" && Number(attempts) > 5) {
    return false;
  }

  const codeValueBuffer = Buffer.from(codeValue, "base64url");
  const codeHash = getHash(code);

  if (codeValueBuffer.length !== codeHash.length) {
    return false;
  }

  const isCodeValid = crypto.timingSafeEqual(codeValueBuffer, codeHash);

  if (!isCodeValid) {
    if (type === "signup") {
      await db
        .update(verification)
        .set({
          value: `${codeValue}:${Number(attempts) + 1}`,
        })
        .where(eq(verification.identifier, identifier));
    }
    return false;
  }

  void db
    .delete(verification)
    .where(eq(verification.identifier, identifier))
    .catch(() => {
      /* empty */
    });

  return true;
}
