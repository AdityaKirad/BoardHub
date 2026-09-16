import { z } from "zod";
import { ACTIONS } from "./action";

export const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal(ACTIONS.COPY_LIST),
    listId: z.string(),
    newListId: z.string(),
    title: z.string(),
    position: z.string(),
  }),
  z.object({
    action: z.literal(ACTIONS.CREATE_LIST),
    listId: z.string(),
    title: z.string(),
    position: z.string(),
  }),
  z.object({
    action: z.literal(ACTIONS.CREATE_CARD),
    cardId: z.string(),
    listId: z.string(),
    title: z.string(),
    position: z.string(),
  }),
  z.object({
    action: z.literal(ACTIONS.MOVE_LIST),
    listId: z.string(),
    position: z.string().min(2),
  }),
  z.object({
    action: z.literal(ACTIONS.MOVE_CARD),
    cardId: z.string(),
    listId: z.string(),
    position: z.string().min(2),
  }),
  z.object({
    action: z.literal(ACTIONS.UPDATE_BOARD_TITLE),
    title: z.string(),
  }),
  z.object({
    action: z.literal(ACTIONS.UPDATE_LIST_TITLE),
    listId: z.string(),
    title: z.string(),
  }),
  z.object({
    action: z.literal(ACTIONS.UPDATE_CARD_TITLE),
    title: z.string(),
    cardId: z.string(),
  }),
  z.object({
    action: z.literal(ACTIONS.TOGGLE_CARD_COMPLETION),
    cardId: z.string(),
    completed: z.preprocess((val) => {
      if (typeof val === "string") {
        if (val === "true") {
          return true;
        }
        if (val === "false") {
          return false;
        }
        return val;
      }
    }, z.boolean()),
  }),
]);
