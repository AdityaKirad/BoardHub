import { eq } from "drizzle-orm";
import { generateKeyBetween } from "fractional-indexing";
import { db } from "~/.server/db";
import { list } from "~/.server/db/schema/workspace";
import { getPositionAtIndex, isAlreadyBetween } from "./position";

export const handleCreateList = async ({
  id,
  boardId,
  title,
}: {
  id: string;
  boardId: string;
  title: string;
}) => {
  const lastList = await db.query.list.findFirst({
    orderBy: (list, { desc }) => [desc(list.position)],
    where: (list, { eq }) => eq(list.boardId, boardId),
  });

  return db.insert(list).values({
    id,
    title,
    boardId,
    position: generateKeyBetween(lastList?.position ?? null, null),
  });
};

export const handleUpdateListTitle = ({
  title,
  listId,
}: {
  title: string;
  listId: string;
}) => db.update(list).set({ title }).where(eq(list.id, listId));

export const handleMoveList = async ({
  listId,
  boardId,
  position,
}: {
  listId: string;
  boardId: string;
  position: number;
}) => {
  const lists = await db.query.list.findMany({
    orderBy: (list, { asc }) => [asc(list.position)],
    where: (list, { eq }) => eq(list.boardId, boardId),
  });

  const currentList = lists.find((item) => item.id === listId);
  if (!currentList) return;

  const otherLists = lists.filter((item) => item.id !== listId);
  const { position: newPosition, before, after } = getPositionAtIndex(
    otherLists,
    position,
  );

  if (
    isAlreadyBetween({
      before,
      after,
      position: currentList.position,
    })
  ) {
    return;
  }

  return db
    .update(list)
    .set({ position: newPosition })
    .where(eq(list.id, listId));
};
