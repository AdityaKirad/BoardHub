import { eq } from "drizzle-orm";
import { db } from "~/.server/db";
import { list } from "~/.server/db/schema/workspace";

export const handleCreateList = async ({
  listId: id,
  boardId,
  position,
  title,
}: {
  listId: string;
  boardId: string;
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

export const handleMoveList = async ({
  listId,
  position,
}: {
  listId: string;
  position: string;
}) => db.update(list).set({ position }).where(eq(list.id, listId));
