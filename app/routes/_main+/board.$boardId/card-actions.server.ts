import { db } from "~/.server/db";
import { card } from "~/.server/db/schema/workspace";
import { eq } from "drizzle-orm";
import { getPositionAtIndex, isAlreadyBetween } from "./position";

export const handleCreateCard = async ({
  id,
  listId,
  position,
  title,
}: {
  id: string;
  listId: string;
  position: string;
  title: string;
}) => {
  return db.insert(card).values({
    id,
    title,
    listId,
    position,
  });
};

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

export const handleMoveCard = async ({
  cardId,
  listId,
  position,
}: {
  cardId: string;
  listId: string;
  position: number;
}) => {
  const currentCard = await db.query.card.findFirst({
    where: (card, { eq }) => eq(card.id, cardId),
  });

  if (!currentCard) return;

  const targetCards = await db.query.card.findMany({
    orderBy: (card, { asc }) => [asc(card.position)],
    where: (card, { eq }) => eq(card.listId, listId),
  });

  const otherCards = targetCards.filter((item) => item.id !== cardId);
  const {
    position: newPosition,
    before,
    after,
  } = getPositionAtIndex(otherCards, position);

  if (
    currentCard.listId === listId &&
    isAlreadyBetween({
      before,
      after,
      position: currentCard.position,
    })
  ) {
    return;
  }

  return db
    .update(card)
    .set({ listId, position: newPosition })
    .where(eq(card.id, cardId));
};
