import { createId } from "@paralleldrive/cuid2";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth";

export const workspace = sqliteTable("workspace", {
  id: text().notNull().primaryKey().$defaultFn(createId),
  name: text().notNull(),
  private: integer({ mode: "boolean" }).notNull().default(true),
});

export const board = sqliteTable("board", {
  id: text().notNull().primaryKey().$defaultFn(createId),
});

export const workspaceMember = sqliteTable("workspace_member", {
  workspaceId: text()
    .notNull()
    .references(() => workspace.id, { onDelete: "cascade" }),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text({ enum: [""] })
    .notNull()
    .default(""),
});
