import { and, eq, exists } from "drizzle-orm";
import { db } from "~/.server/db";
import { board, card, list } from "~/.server/db/schema/workspace";

export const boardBelongsToUser = (boardId: string, userId: string) =>
  exists(
    db
      .select({ id: board.id })
      .from(board)
      .where(and(eq(board.id, boardId), eq(board.userId, userId))),
  );

export const cardBelongsToUser = (userId: string) =>
  exists(
    db
      .select({ id: board.id })
      .from(board)
      .innerJoin(list, eq(board.id, list.boardId))
      .where(and(eq(board.userId, userId), eq(list.id, card.listId))),
  );

export const listBelongsToUser = (userId: string) =>
  exists(
    db
      .select({ id: board.id })
      .from(board)
      .where(and(eq(board.id, list.boardId), eq(board.userId, userId))),
  );

export const listIdBelongsToUser = (listId: string, userId: string) =>
  exists(
    db
      .select({ id: list.id })
      .from(list)
      .innerJoin(board, eq(board.id, list.boardId))
      .where(and(eq(list.id, listId), eq(board.userId, userId))),
  );
