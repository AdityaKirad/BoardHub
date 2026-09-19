import { z } from "zod";
import { ACTIONS } from "../action";

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
  listId: z.string(),
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
  copyList,
  createList,
  moveList,
  togglePinList,
  updateListTitle,
] as const;

export type CopyList = Omit<z.infer<typeof copyList>, "action">;
export type CreateList = Omit<z.infer<typeof createList>, "action">;
export type MoveList = Omit<z.infer<typeof moveList>, "action">;
export type TogglePinList = Omit<z.infer<typeof togglePinList>, "action">;
export type UpdateListTitle = Omit<z.infer<typeof updateListTitle>, "action">;
