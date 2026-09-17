import { eq } from "drizzle-orm";
import { db } from "~/.server/db";
import { card, list } from "~/.server/db/schema/workspace";

export const handleCopyList = ({
  sourceListId,
  ...listData
}: {
  boardId: string;
  id: string;
  sourceListId: string;
  position: string;
  title: string;
}) =>
  db.transaction(async (tx) => {
    const [newList] = await tx
      .insert(list)
      .values(listData)
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
      where: (card, { eq }) => eq(card.listId, sourceListId),
    });

    if (cards.length) {
      await tx
        .insert(card)
        .values(cards.map((card) => ({ ...card, listId: newList.id })));
    }
  });

export const handleCreateList = (listData: {
  id: string;
  boardId: string;
  position: string;
  title: string;
}) => db.insert(list).values(listData);

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
