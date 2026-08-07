import type { Logger } from "drizzle-orm/logger";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { drizzle } from "drizzle-orm/libsql";
import { createClient, type Client, type ResultSet } from "@libsql/client";
import * as authSchema from "./schema/auth";
import * as workspaceSchema from "./schema/workspace";
import { env } from "~/env.server";
import type { SQLiteTransaction } from "drizzle-orm/sqlite-core";
import type { ExtractTablesWithRelations } from "drizzle-orm";

type Schema = typeof authSchema & typeof workspaceSchema;

class MyLogger implements Logger {
  logQuery(query: string, params: unknown[]): void {
    console.log({ query, params });
  }
}

const globalForClient = globalThis as unknown as {
  client: Client | undefined;
};

const client =
  globalForClient.client ??
  createClient({
    url: env.DATABASE_URL,
    authToken: env.DATABASE_AUTH_TOKEN,
  });

if (env.NODE_ENV !== "production") globalForClient.client = client;

export const db = drizzle(client, {
  schema: {
    ...authSchema,
    ...workspaceSchema,
  },
  logger: new MyLogger(),
});

export type DBAdapter =
  | (LibSQLDatabase<Schema> & { $client: Client })
  | SQLiteTransaction<
      "async",
      ResultSet,
      Schema,
      ExtractTablesWithRelations<Schema>
    >;
