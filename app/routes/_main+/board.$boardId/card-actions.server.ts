import { db } from "~/.server/db";
import { card } from "~/.server/db/schema/workspace";
import { eq, inArray, sql, type SQLChunk } from "drizzle-orm";
import { generateNKeysBetween } from "fractional-indexing";

export const handleCreateCard = (cardData: {
  id: string;
  listId: string;
  position: string;
  title: string;
}) => {
  return db.insert(card).values(cardData);
};

export const handleUpdateCardTitle = ({
  cardId,
  title,
}: {
  cardId: string;
  title: string;
}) => db.update(card).set({ title }).where(eq(card.id, cardId));

export const handleToggleCardCompleted = ({
  cardId,
  completed,
}: {
  cardId: string;
  completed: boolean;
}) =>
  db
    .update(card)
    .set({
      completed,
    })
    .where(eq(card.id, cardId));

export const handleMoveCard = ({
  id,
  ...moveData
}: {
  id: string;
  listId: string;
  position: string;
}) => db.update(card).set(moveData).where(eq(card.id, id));

export const handleMoveCardsInThisList = ({
  destinationListId,
  sourceListId,
}: {
  destinationListId: string;
  sourceListId: string;
}) =>
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

    const sqlChunks: SQLChunk[] = [];

    sqlChunks.push(sql`CASE id`);
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
