import { useFetchers, useParams } from "react-router";
import { ACTIONS } from "../action";
import type { Lists } from "../types";
import { copyList, createList, moveList, togglePinList } from "./list-action";
import { createCard, moveCard, moveCardInThisList } from "./card-actions";

export function useOptimisticLists(lists: Lists) {
  const fetchers = useFetchers();
  const params = useParams();

  for (const fetcher of fetchers) {
    const formData = fetcher.formData;

    if (!formData) {
      continue;
    }

    const action = formData.get("action");

    if (
      action === ACTIONS.COPY_LIST ||
      action === ACTIONS.CREATE_LIST ||
      action === ACTIONS.MOVE_LIST ||
      action === ACTIONS.TOGGLE_PIN_LIST
    ) {
      const { id, boardId, sourceListId, title, position } = Object.fromEntries(
        formData,
      ) as {
        id: string;
        boardId: string | undefined;
        sourceListId: string;
        title: string;
        position: string;
      };

      const newLists =
        action === ACTIONS.COPY_LIST
          ? copyList(lists, { id, sourceListId, position, title })
          : action === ACTIONS.CREATE_LIST
            ? createList(lists, { id, title, position })
            : action === ACTIONS.MOVE_LIST
              ? moveList(lists, {
                  boardId,
                  position,
                  sourceListId,
                  currentBoardId: params.boardId!,
                })
              : togglePinList(lists, { id });

      lists = newLists.sort((a, b) => sortPosition(a.position, b.position));
    }

    if (
      action === ACTIONS.CREATE_CARD ||
      action === ACTIONS.MOVE_CARD ||
      action === ACTIONS.MOVE_CARDS_IN_THIS_LIST
    ) {
      const { id, listId, title, position, destinationListId, sourceListId } =
        Object.fromEntries(formData) as {
          id: string;
          listId: string;
          title: string;
          position: string;
          destinationListId: string;
          sourceListId: string;
        };

      lists =
        action === ACTIONS.CREATE_CARD
          ? createCard(lists, { id, listId, position, title })
          : action === ACTIONS.MOVE_CARDS_IN_THIS_LIST
            ? moveCardInThisList(lists, { destinationListId, sourceListId })
            : moveCard(lists, { id, listId, position });
    }
  }

  return lists;
}

export const sortPosition = (a: string, b: string) =>
  a < b ? -1 : a > b ? 1 : 0;
