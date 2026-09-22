import { db } from "~/.server/db";
import { card } from "~/.server/db/schema/workspace";
import { eq, inArray, sql, type SQLChunk } from "drizzle-orm";
import { generateNKeysBetween } from "fractional-indexing";
import type {
  ArchiveAllCardInList,
  CreateCard,
  MoveCard,
  MoveCardInThisList,
  SortList,
  ToggleCardCompletion,
  UpdateCardTitle,
} from "./schema/card";

export const handleArchiveAllCardInList = ({ listId }: ArchiveAllCardInList) =>
  db.update(card).set({ archived: true }).where(eq(card.listId, listId));

export const handleCreateCard = (cardData: CreateCard) =>
  db.insert(card).values(cardData);

export const handleMoveCard = ({ id, ...moveData }: MoveCard) =>
  db.update(card).set(moveData).where(eq(card.id, id));

export const handleMoveCardsInThisList = ({
  destinationListId,
  sourceListId,
}: MoveCardInThisList) =>
  db.transaction(async (tx) => {
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

export const handleSortList = ({ listId, sortBy }: SortList) =>
  db.transaction(async (tx) => {
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

export const handleToggleCardCompleted = ({
  id,
  completed,
}: ToggleCardCompletion) =>
  db
    .update(card)
    .set({
      completed,
    })
    .where(eq(card.id, id));

export const handleUpdateCardTitle = ({ id, title }: UpdateCardTitle) =>
  db.update(card).set({ title }).where(eq(card.id, id));
