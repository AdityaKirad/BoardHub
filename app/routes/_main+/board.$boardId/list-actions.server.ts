import { eq } from "drizzle-orm";
import { db } from "~/.server/db";
import { card, list } from "~/.server/db/schema/workspace";

export const handleCopyList = ({
  boardId,
  listId,
  newListId,
  title,
  position,
}: {
  boardId: string;
  listId: string;
  newListId: string;
  position: string;
  title: string;
}) =>
  db.transaction(async (tx) => {
    const [newList] = await tx
      .insert(list)
      .values({
        boardId,
        position,
        title,
        id: newListId,
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
      where: (card, { eq }) => eq(card.listId, listId),
    });

    if (cards.length) {
      await tx
        .insert(card)
        .values(cards.map((card) => ({ ...card, listId: newList.id })));
    }
  });

export const handleCreateList = ({
  listId: id,
  boardId,
  position,
  title,
}: {
  boardId: string;
  listId: string;
  position: string;
  title: string;
}) =>
  db.insert(list).values({
    id,
    title,
    boardId,
    position,
  });

export const handleUpdateListTitle = ({
  title,
  listId,
}: {
  title: string;
  listId: string;
}) => db.update(list).set({ title }).where(eq(list.id, listId));

export const handleMoveList = ({
  boardId,
  listId,
  position,
}: {
  boardId?: string;
  listId: string;
  position: string;
}) => db.update(list).set({ boardId, position }).where(eq(list.id, listId));
