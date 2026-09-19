import type { Lists } from "../types";

export const createList = (
  lists: Lists,
  listData: { id: string; title: string; position: string },
) => [
  ...lists,
  {
    ...listData,
    archived: false,
    color: "",
    cards: [],
  },
];

export const copyList = (
  lists: Lists,
  {
    sourceListId,
    ...listData
  }: {
    id: string;
    sourceListId: string;
    position: string;
    title: string;
  },
) => [
  ...lists,
  {
    ...lists.find((list) => list.id === sourceListId)!,
    ...listData,
  },
];

export const moveList = (
  lists: Lists,
  {
    boardId,
    currentBoardId,
    sourceListId,
    position,
  }: {
    boardId: string | undefined;
    currentBoardId: string;
    sourceListId: string;
    position: string;
  },
) =>
  boardId && boardId !== currentBoardId
    ? lists.filter((list) => list.id !== sourceListId)
    : lists.map((list) =>
        list.id === sourceListId ? { ...list, position } : list,
      );

export const togglePinList = (lists: Lists, { id }: { id: string }) =>
  lists.map((list) =>
    list.id === id ? { ...list, pinned: !list.pinned } : list,
  );
