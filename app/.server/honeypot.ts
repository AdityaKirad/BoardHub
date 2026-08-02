import { Honeypot, SpamError } from "remix-utils/honeypot/server";
import { env } from "~/env.server";

export const honeypot = new Honeypot({
  encryptionSeed: env.HONEYPOT_SEED,
});

export async function checkHoneyPot(formData: FormData) {
  try {
    await honeypot.check(formData);
  } catch (error: unknown) {
    if (error instanceof SpamError) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw new Response("Form not submitted properly", { status: 400 });
    }
    throw error;
  }
}
