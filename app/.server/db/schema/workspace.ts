import { createId } from "@paralleldrive/cuid2";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth";
import { relations } from "drizzle-orm";

export const workspace = sqliteTable("workspace", {
  id: text().notNull().primaryKey().$defaultFn(createId),
  name: text().notNull(),
  private: integer({ mode: "boolean" }).notNull().default(true),
});

export const board = sqliteTable("board", {
  id: text().notNull().primaryKey().$defaultFn(createId),
  title: text().notNull(),
});

export const list = sqliteTable("list", {
  id: text().notNull().primaryKey().$defaultFn(createId),
  title: text().notNull(),
  color: text(),
  archived: integer({ mode: "boolean" }).notNull().default(false),
  boardId: text()
    .notNull()
    .references(() => board.id, { onDelete: "cascade" }),
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

export const boardRelations = relations(board, ({ many }) => ({
  lists: many(list),
}));

export const listRelations = relations(list, ({ one }) => ({
  board: one(board, {
    fields: [list.boardId],
    references: [board.id],
  }),
}));
