import { z } from "zod";
import { ACTIONS } from "../action";
import type { WithoutAction } from ".";

const archiveAllCardInList = z.object({
  action: z.literal(ACTIONS.ARCHIVE_ALL_CARD_IN_LIST),
  listId: z.string(),
});

const archiveCard = z.object({
  action: z.literal(ACTIONS.ARCHIVE_CARD),
  id: z.string(),
});

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
  archiveAllCardInList,
  archiveCard,
  createCard,
  moveCard,
  moveCardInThisList,
  sortList,
  toggleCardCompletion,
  updateCardTitle,
] as const;

export type ArchiveAllCardInList = WithoutAction<
  z.infer<typeof archiveAllCardInList>
>;
export type ArchiveCard = WithoutAction<z.infer<typeof archiveCard>>;
export type CreateCard = WithoutAction<z.infer<typeof createCard>>;
export type MoveCard = WithoutAction<z.infer<typeof moveCard>>;
export type MoveCardInThisList = WithoutAction<
  z.infer<typeof moveCardInThisList>
>;
export type ToggleCardCompletion = WithoutAction<
  z.infer<typeof toggleCardCompletion>
>;
export type SortList = WithoutAction<z.infer<typeof sortList>>;
export type UpdateCardTitle = WithoutAction<z.infer<typeof updateCardTitle>>;
