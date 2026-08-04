import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";
import {
  relations,
  sql,
  type InferInsertModel,
  type InferSelectModel,
} from "drizzle-orm";

const timestamps = {
  createdAt: integer({ mode: "timestamp_ms" })
    .notNull()
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
  updatedAt: integer({ mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdateFn(() => new Date())
    .notNull(),
  expiresAt: integer({ mode: "timestamp_ms" }).notNull(),
};

export const user = sqliteTable("user", {
  id: text().notNull().primaryKey().$defaultFn(createId),
  name: text().notNull(),
  email: text().notNull().unique(),
  username: text().notNull().unique(),
  verified: integer({ mode: "boolean" }).notNull().default(false),
  photo: text(),
  createdAt: timestamps.createdAt,
  updatedAt: timestamps.updatedAt,
});

export const account = sqliteTable(
  "account",
  {
    id: text().notNull().primaryKey().$defaultFn(createId),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    provider: text().notNull(),
    providerId: text().notNull(),
    password: text(),
    createdAt: timestamps.createdAt,
    updatedAt: timestamps.updatedAt,
  },
  (table) => [
    index("account_user_id_idx").on(table.userId),
    uniqueIndex("account_provider_provider_id_unique_idx").on(
      table.provider,
      table.providerId,
    ),
  ],
);

export const verification = sqliteTable("verification", {
  id: text().notNull().primaryKey().$defaultFn(createId),
  identifier: text().notNull().unique(),
  value: text().notNull(),
  ...timestamps,
});

export const session = sqliteTable(
  "session",
  {
    id: text().notNull().primaryKey().$defaultFn(createId),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    token: text().notNull().unique(),
    userAgent: text(),
    ipAddress: text(),
    location: text(),
    ...timestamps,
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const userRelations = relations(user, ({ many }) => ({
  accounts: many(account),
  sessions: many(session),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export type UserInsertType = InferInsertModel<typeof user>;
export type UserSelectType = InferSelectModel<typeof user>;
export type SessionSelectType = InferSelectModel<typeof session>;
