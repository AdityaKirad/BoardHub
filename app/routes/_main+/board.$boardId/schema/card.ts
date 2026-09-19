import { z } from "zod";
import { ACTIONS } from "../action";

const createCard = z.object({
  action: z.literal(ACTIONS.CREATE_CARD),
  id: z.string(),
  listId: z.string(),
  title: z.string(),
  position: z.string(),
});

const moveCard = z.object({
  action: z.literal(ACTIONS.MOVE_CARD),
  id: z.string(),
  listId: z.string(),
  position: z.string(),
});

const moveCardInThisList = z.object({
  action: z.literal(ACTIONS.MOVE_CARDS_IN_THIS_LIST),
  destinationListId: z.string(),
  sourceListId: z.string(),
});

const sortList = z.object({
  action: z.literal(ACTIONS.SORT_LIST),
  listId: z.string(),
  sortBy: z.enum(["created-asc", "created-desc", "title"]),
});

const toggleCardCompletion = z.object({
  action: z.literal(ACTIONS.TOGGLE_CARD_COMPLETION),
  id: z.string(),
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
});

const updateCardTitle = z.object({
  action: z.literal(ACTIONS.UPDATE_CARD_TITLE),
  title: z.string(),
  id: z.string(),
});

export const cardSchemas = [
  createCard,
  moveCard,
  moveCardInThisList,
  sortList,
  toggleCardCompletion,
  updateCardTitle,
] as const;

export type CreateCard = Omit<z.infer<typeof createCard>, "action">;
export type MoveCard = Omit<z.infer<typeof moveCard>, "action">;
export type MoveCardInThisList = Omit<
  z.infer<typeof moveCardInThisList>,
  "action"
>;
export type ToggleCardCompletion = Omit<
  z.infer<typeof toggleCardCompletion>,
  "action"
>;
export type SortList = Omit<z.infer<typeof sortList>, "action">;
export type UpdateCardTitle = Omit<z.infer<typeof updateCardTitle>, "action">;
