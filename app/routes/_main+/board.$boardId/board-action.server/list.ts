import { and, eq, not } from "drizzle-orm";
import { db } from "~/.server/db";
import { board, card, list } from "~/.server/db/schema/workspace";
import type {
  ArchiveList,
  CopyList,
  CreateList,
  MoveList,
  TogglePinList,
  UpdateListTitle,
} from "../schema/list";
import { boardBelongsToUser, listBelongsToUser } from "./ownership";

export const handleArchiveList = (userId: string, { id }: ArchiveList) =>
  db
    .update(list)
    .set({ archived: true })
    .where(and(eq(list.id, id), listBelongsToUser(userId)));

export const handleCopyList = (
  userId: string,
  { sourceListId, ...listData }: CopyList,
) =>
  db.transaction(async (tx) => {
    const [sourceList] = await tx
      .select({ boardId: list.boardId })
      .from(list)
      .innerJoin(board, eq(board.id, list.boardId))
      .where(and(eq(list.id, sourceListId), eq(board.userId, userId)))
      .limit(1);

    if (!sourceList) {
      throw new Error("You don't have permission to copy this list");
    }

    const [newList] = await tx
      .insert(list)
      .values({
        ...listData,
        boardId: sourceList.boardId,
      })
      .returning({ id: list.id });

    if (!newList) {
      throw new Error("Failed to create list");
    }

    const cards = await tx.query.card.findMany({
      columns: {
        title: true,
        description: true,
        completed: true,
        position: true,
      },
      where: (card, { and, eq }) =>
        and(eq(card.listId, sourceListId), eq(card.archived, false)),
    });

    if (cards.length) {
      await tx
        .insert(card)
        .values(cards.map((card) => ({ ...card, listId: newList.id })));
    }
  });

export const handleCreateList = (
  userId: string,
  listData: CreateList & { boardId: string },
) =>
  db.transaction(async (tx) => {
    const board = await tx.query.board.findFirst({
      columns: { id: true },
      where: (board, { and, eq }) =>
        and(eq(board.id, listData.boardId), eq(board.userId, userId)),
    });

    if (!board?.id) {
      throw new Error("You don't have permission to create this list");
    }

    return tx.insert(list).values(listData);
  });

export const handleUpdateListTitle = (
  userId: string,
  { id, title }: UpdateListTitle,
) =>
  db
    .update(list)
    .set({ title })
    .where(and(eq(list.id, id), listBelongsToUser(userId)));

export const handleMoveList = (userId: string, { id, ...moveData }: MoveList) =>
  db
    .update(list)
    .set(moveData)
    .where(
      and(
        eq(list.id, id),
        listBelongsToUser(userId),
        moveData.boardId
          ? boardBelongsToUser(moveData.boardId, userId)
          : undefined,
      ),
    );

export const handleTogglePinList = (userId: string, { id }: TogglePinList) =>
  db
    .update(list)
    .set({ pinned: not(list.pinned) })
    .where(and(eq(list.id, id), listBelongsToUser(userId)));
