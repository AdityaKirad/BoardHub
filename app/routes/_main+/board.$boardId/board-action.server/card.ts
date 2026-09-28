import { db } from "~/.server/db";
import { board, card, list } from "~/.server/db/schema/workspace";
import { and, eq, inArray, sql, type SQLChunk } from "drizzle-orm";
import { generateNKeysBetween } from "fractional-indexing";
import type {
  ArchiveAllCardInList,
  ArchiveCard,
  CreateCard,
  MoveCard,
  MoveCardInThisList,
  SortList,
  ToggleCardCompletion,
  UpdateCardTitle,
} from "../schema/card";
import { cardBelongsToUser, listIdBelongsToUser } from "./ownership";

export const handleArchiveAllCardInList = (
  userId: string,
  { listId }: ArchiveAllCardInList,
) =>
  db
    .update(card)
    .set({ archived: true })
    .where(and(eq(card.listId, listId), cardBelongsToUser(userId)));

export const handleArchiveCard = (userId: string, { id }: ArchiveCard) =>
  db
    .update(card)
    .set({ archived: true })
    .where(and(eq(card.id, id), cardBelongsToUser(userId)));

export const handleCreateCard = (userId: string, cardData: CreateCard) =>
  db.transaction(async (tx) => {
    const [ownedList] = await tx
      .select({ id: list.id })
      .from(list)
      .innerJoin(board, eq(board.id, list.boardId))
      .where(and(eq(list.id, cardData.listId), eq(board.userId, userId)))
      .limit(1);

    if (!ownedList) {
      throw new Error("You don't have permission to create this card");
    }

    return tx.insert(card).values(cardData);
  });

export const handleMoveCard = (
  userId: string,
  { sourceListId: _sourceListId, id, ...moveData }: MoveCard,
) =>
  db
    .update(card)
    .set(moveData)
    .where(
      and(
        eq(card.id, id),
        cardBelongsToUser(userId),
        listIdBelongsToUser(moveData.listId, userId),
      ),
    )
    .returning({ id: card.id });

export function handleMoveCardsInThisList(
  userId: string,
  { destinationListId, sourceListId }: MoveCardInThisList,
) {
  if (destinationListId === sourceListId) {
    return;
  }

  return db.transaction(async (tx) => {
    const ownedLists = await tx
      .select({ id: list.id })
      .from(list)
      .innerJoin(board, eq(board.id, list.boardId))
      .where(
        and(
          inArray(list.id, [destinationListId, sourceListId]),
          eq(board.userId, userId),
        ),
      );

    if (ownedLists.length !== 2) {
      throw new Error("You don't have permission to move cards in this list");
    }

    const cards = await tx.query.card.findMany({
      where: (card, { eq }) => eq(card.listId, sourceListId),
      orderBy: (card, { asc }) => asc(card.position),
    });

    if (!cards.length) {
      return;
    }

    const lastDestinationCardPosition = await tx.query.card.findFirst({
      columns: {
        position: true,
      },
      where: (card, { eq }) => eq(card.listId, destinationListId),
      orderBy: (card, { desc }) => desc(card.position),
    });

    const newPositions = generateNKeysBetween(
      lastDestinationCardPosition?.position,
      null,
      cards.length,
    );

    const sqlChunks: SQLChunk[] = [sql`CASE id`];

    cards.forEach((card, index) =>
      sqlChunks.push(sql`WHEN ${card.id} THEN ${newPositions[index]}`),
    );
    sqlChunks.push(sql`END`);

    return tx
      .update(card)
      .set({
        listId: destinationListId,
        position: sql.join(sqlChunks, sql.raw(" ")),
      })
      .where(
        inArray(
          card.id,
          cards.map((card) => card.id),
        ),
      );
  });
}

export const handleSortList = (userId: string, { listId, sortBy }: SortList) =>
  db.transaction(async (tx) => {
    const [boardId] = await tx
      .select({ id: board.id })
      .from(list)
      .rightJoin(board, eq(board.id, list.boardId))
      .where(and(eq(list.id, listId), eq(board.userId, userId)))
      .limit(1);

    if (!boardId) {
      throw new Error("You don't have permission to sort this list");
    }

    const cards = await tx.query.card.findMany({
      where: (card, { eq }) => eq(card.listId, listId),
      orderBy(card, { asc, desc }) {
        switch (sortBy) {
          case "created-asc":
            return asc(card.createdAt);
          case "created-desc":
            return desc(card.createdAt);
          case "title":
            return asc(card.title);
        }
      },
    });

    if (cards.length < 2) {
      return;
    }

    const newPositions = generateNKeysBetween(null, null, cards.length);

    const sqlChunks: SQLChunk[] = [sql`CASE id`];

    cards.forEach((card, index) =>
      sqlChunks.push(sql`WHEN ${card.id} THEN ${newPositions[index]}`),
    );
    sqlChunks.push(sql`END`);

    return tx
      .update(card)
      .set({
        position: sql.join(sqlChunks, sql.raw(" ")),
      })
      .where(
        inArray(
          card.id,
          cards.map((card) => card.id),
        ),
      );
  });

export const handleToggleCardCompleted = (
  userId: string,
  { id, completed }: ToggleCardCompletion,
) =>
  db
    .update(card)
    .set({
      completed,
    })
    .where(and(eq(card.id, id), cardBelongsToUser(userId)));

export const handleUpdateCardTitle = (
  userId: string,
  { id, title }: UpdateCardTitle,
) =>
  db
    .update(card)
    .set({ title })
    .where(and(eq(card.id, id), cardBelongsToUser(userId)));
