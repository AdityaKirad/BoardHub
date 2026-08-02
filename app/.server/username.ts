import type { DBAdapter } from "~/server/db";

function sanitizeUsername(str: string): string {
  return str.replace(/[^a-zA-Z0-9_]/g, "");
}

function ensureValidStart(username: string): string {
  if (!username) return username;
  if (/^[a-zA-Z0-9]/.test(username)) return username;
  return `u${username}`;
}

function generateSuffixes(): string[] {
  return [
    Math.floor(Math.random() * 100).toString(),
    Math.floor(Math.random() * 1000).toString(),
    Math.floor(Math.random() * 10000).toString(),
    Math.floor(Math.random() * 100000).toString(),
    Math.floor(Math.random() * 1000000).toString(),
    (Date.now() % 10000).toString(),
    ((Date.now() % 100000) + Math.floor(Math.random() * 1000)).toString(),
  ];
}

async function checkBatchAvailability(
  adapter: DBAdapter,
  usernames: string[],
): Promise<Set<string>> {
  if (usernames.length === 0) return new Set();

  const existing = await adapter.query.user.findMany({
    columns: { username: true },
    where: (user, { inArray }) => inArray(user.username, usernames),
  });

  return new Set(existing.map((u) => u.username));
}

export async function generateUsernameSuggestions(
  adapter: DBAdapter,
  {
    name,
    email,
    count = 3,
  }: {
    name: string;
    email: string;
    count: number;
  },
) {
  const sanitizedName = sanitizeUsername(
    name.toLowerCase().replace(/\s+/g, ""),
  );

  const emailPrefix = email.split("@")[0];
  const sanitizedEmail = sanitizeUsername(emailPrefix ?? "");

  let bases = [sanitizedName, sanitizedEmail]
    .map(ensureValidStart)
    .filter((base) => base.length >= 4);

  if (bases.length === 0) {
    bases = ["user"];
  }

  const candidates: string[] = [];

  for (const base of bases) {
    candidates.push(base);

    for (const suffix of generateSuffixes()) {
      candidates.push(`${base}${suffix}`);
    }
  }

  const taken = await checkBatchAvailability(adapter, candidates);
  const available = candidates.filter((username) => !taken.has(username));

  return available.slice(0, count);
}
