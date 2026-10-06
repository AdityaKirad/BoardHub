import type {
  ArchiveList,
  CopyList,
  CreateList,
  MoveList,
  ToggleCollapseList,
  TogglePinList,
} from "../schema/list";
import type { Lists } from "../types";

export const archiveList = (lists: Lists, { id }: ArchiveList) =>
  lists.map((list) => (list.id === id ? { ...list, archived: true } : list));

export const createList = (lists: Lists, listData: CreateList) => [
  ...lists,
  {
    ...listData,
    pinned: false,
    archived: false,
    collapsed: false,
    color: "",
    cards: [],
  },
];

export const copyList = (
  lists: Lists,
  { sourceListId, ...listData }: CopyList,
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
    id,
    position,
  }: MoveList & { currentBoardId: string },
) =>
  boardId && boardId !== currentBoardId
    ? lists.filter((list) => list.id !== id)
    : lists.map((list) => (list.id === id ? { ...list, position } : list));

export const toggleCollapseList = (
  lists: Lists,
  { collapsed, id }: ToggleCollapseList,
) => lists.map((list) => (list.id === id ? { ...list, collapsed } : list));

export const togglePinList = (lists: Lists, { id }: TogglePinList) =>
  lists.map((list) =>
    list.id === id ? { ...list, pinned: !list.pinned } : list,
  );
