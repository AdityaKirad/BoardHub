import { useFetchers, useParams } from "react-router";
import { ACTIONS } from "../action";
import type { Lists } from "../types";
import {
  archiveList,
  copyList,
  createList,
  moveList,
  togglePinList,
} from "./list-action";
import {
  archiveAllCardInList,
  createCard,
  moveCard,
  moveCardInThisList,
} from "./card-actions";
import { schema } from "../schema";
import type { z } from "zod";

export function useOptimisticLists(lists: Lists) {
  const fetchers = useFetchers();
  const params = useParams();

  for (const fetcher of fetchers) {
    const formData = fetcher.formData;

    if (!formData) {
      continue;
    }

    const parsed = schema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
      continue;
    }

    lists = applyOptimisticAction(lists, {
      boardId: params.boardId!,
      data: parsed.data,
    });
  }

  return lists
    .map((list) => ({
      ...list,
      cards: [...list.cards].sort((a, b) =>
        sortPosition(a.position, b.position),
      ),
    }))
    .sort((a, b) => sortPosition(a.position, b.position));
}

function applyOptimisticAction(
  lists: Lists,
  { boardId, data }: { boardId: string; data: z.infer<typeof schema> },
) {
  switch (data.action) {
    case ACTIONS.ARCHIVE_ALL_CARD_IN_LIST:
      return archiveAllCardInList(lists, data);
    case ACTIONS.ARCHIVE_LIST:
      return archiveList(lists, data);
    case ACTIONS.COPY_LIST:
      return copyList(lists, data);
    case ACTIONS.CREATE_CARD:
      return createCard(lists, data);
    case ACTIONS.CREATE_LIST:
      return createList(lists, data);
    case ACTIONS.MOVE_CARD:
      return moveCard(lists, data);
    case ACTIONS.MOVE_CARDS_IN_THIS_LIST:
      return moveCardInThisList(lists, data);
    case ACTIONS.MOVE_LIST:
      return moveList(lists, { ...data, currentBoardId: boardId });
    case ACTIONS.TOGGLE_PIN_LIST:
      return togglePinList(lists, { id: data.id });
    default:
      return lists;
  }
}

const sortPosition = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
