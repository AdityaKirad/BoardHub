import { eq, not } from "drizzle-orm";
import { db } from "~/.server/db";
import { card, list } from "~/.server/db/schema/workspace";
import type {
  ArchiveList,
  CopyList,
  CreateList,
  MoveList,
  TogglePinList,
  UpdateListTitle,
} from "./schema/list";

export const handleArchiveList = ({ id }: ArchiveList) =>
  db.update(list).set({ archived: true }).where(eq(list.id, id));

export const handleCopyList = ({
  sourceListId,
  ...listData
}: CopyList & { boardId: string }) =>
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

export const handleCreateList = (listData: CreateList & { boardId: string }) =>
  db.insert(list).values(listData);

export const handleUpdateListTitle = ({ id, title }: UpdateListTitle) =>
  db.update(list).set({ title }).where(eq(list.id, id));

export const handleMoveList = ({ boardId, id, position }: MoveList) =>
  db.update(list).set({ boardId, position }).where(eq(list.id, id));

export const handleTogglePinList = ({ id }: TogglePinList) =>
  db
    .update(list)
    .set({ pinned: not(list.pinned) })
    .where(eq(list.id, id));
