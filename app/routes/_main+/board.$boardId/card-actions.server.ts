import { db } from "~/.server/db";
import { card } from "~/.server/db/schema/workspace";
import { eq } from "drizzle-orm";

export const handleCreateCard = async ({
  cardId: id,
  listId,
  position,
  title,
}: {
  cardId: string;
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

export const handleMoveCard = async ({
  cardId,
  listId,
  position,
}: {
  cardId: string;
  listId: string;
  position: string;
}) => db.update(card).set({ listId, position }).where(eq(card.id, cardId));
