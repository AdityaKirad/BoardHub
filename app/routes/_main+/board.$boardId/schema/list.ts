import { z } from "zod";
import { ACTIONS } from "../action";
import type { WithoutAction } from ".";

const archiveList = z.object({
  action: z.literal(ACTIONS.ARCHIVE_LIST),
  id: z.string(),
});

const copyList = z.object({
  action: z.literal(ACTIONS.COPY_LIST),
  id: z.string(),
  sourceListId: z.string(),
  title: z.string(),
  position: z.string(),
});

const createList = z.object({
  action: z.literal(ACTIONS.CREATE_LIST),
  id: z.string(),
  title: z.string(),
  position: z.string(),
});

const moveList = z.object({
  action: z.literal(ACTIONS.MOVE_LIST),
  boardId: z.string().optional(),
  id: z.string(),
  position: z.string(),
});

const togglePinList = z.object({
  action: z.literal(ACTIONS.TOGGLE_PIN_LIST),
  id: z.string(),
});

const updateListTitle = z.object({
  action: z.literal(ACTIONS.UPDATE_LIST_TITLE),
  id: z.string(),
  title: z.string(),
});

export const listSchemas = [
  archiveList,
  copyList,
  createList,
  moveList,
  togglePinList,
  updateListTitle,
] as const;

export type ArchiveList = WithoutAction<z.infer<typeof archiveList>>;
export type CopyList = WithoutAction<z.infer<typeof copyList>>;
export type CreateList = WithoutAction<z.infer<typeof createList>>;
export type MoveList = WithoutAction<z.infer<typeof moveList>>;
export type TogglePinList = WithoutAction<z.infer<typeof togglePinList>>;
export type UpdateListTitle = WithoutAction<z.infer<typeof updateListTitle>>;
