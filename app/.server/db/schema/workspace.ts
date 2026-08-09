import { createId } from "@paralleldrive/cuid2";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth";
import { relations, type InferSelectModel } from "drizzle-orm";
import { timestamps } from "../timestamp";

export const workspace = sqliteTable("workspace", {
  id: text().notNull().primaryKey().$defaultFn(createId),
  name: text().notNull(),
  private: integer({ mode: "boolean" }).notNull().default(true),
});

export const board = sqliteTable("board", {
  id: text().notNull().primaryKey().$defaultFn(createId),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text().notNull(),
  background: text().notNull(),
});

export const list = sqliteTable("list", {
  id: text().notNull().primaryKey().$defaultFn(createId),
  boardId: text()
    .notNull()
    .references(() => board.id, { onDelete: "cascade" }),
  title: text().notNull(),
  color: text(),
  archived: integer({ mode: "boolean" }).notNull().default(false),
  position: integer().notNull(),
  createdAt: timestamps.createdAt,
  updatedAt: timestamps.updatedAt,
});

export const card = sqliteTable("card", {
  id: text().notNull().primaryKey().$defaultFn(createId),
  listId: text()
    .notNull()
    .references(() => list.id, { onDelete: "cascade" }),
  title: text().notNull(),
  description: text(),
  completed: integer({ mode: "boolean" }).notNull().default(false),
  position: integer().notNull(),
  createdAt: timestamps.createdAt,
  updatedAt: timestamps.updatedAt,
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

export const boardRelations = relations(board, ({ one, many }) => ({
  lists: many(list),
  user: one(user, {
    fields: [board.userId],
    references: [user.id],
  }),
}));

export const listRelations = relations(list, ({ one, many }) => ({
  board: one(board, {
    fields: [list.boardId],
    references: [board.id],
  }),
  cards: many(card),
}));

export const cardRelations = relations(card, ({ one }) => ({
  list: one(list, {
    fields: [card.listId],
    references: [list.id],
  }),
}));

export type ListSelectType = InferSelectModel<typeof list>;
export type CardSelectType = InferSelectModel<typeof card>;
