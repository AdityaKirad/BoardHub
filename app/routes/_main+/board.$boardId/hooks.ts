import { useEffect, useRef } from "react";
import { useFetchers, useSubmit } from "react-router";
import { ACTIONS } from "./action";
import type { Route } from "./+types/route";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { generateKeyBetween } from "fractional-indexing";

interface BaseType {
  id: string;
  title: string | null;
  position: string;
}

interface CardType extends BaseType {
  listId: string;
}

interface ListType extends BaseType {
  cards: CardType[];
}

type BoardLists = Route.ComponentProps["loaderData"]["board"]["lists"];

export function usePendingChanges() {
  const fetchers = useFetchers();
  const pendingLists: ListType[] = [];
  const pendingCardsByList = new Map<string, CardType[]>();
  const pendingCardIds = new Set<string>();
  const pendingListIds = new Set<string>();

  for (const fetcher of fetchers) {
    const formData = fetcher.formData;

    if (!formData) {
      continue;
    }

    const action = formData.get("action");

    if (action === ACTIONS.CREATE_LIST || action === ACTIONS.MOVE_LIST) {
      const id = formData.get("id") as string;

      pendingListIds.add(id);
      pendingLists.push({
        id,
        title: formData.get("title") as string,
        position: formData.get("position") as string,
        cards: [],
      });
      continue;
    }

    if (action === ACTIONS.CREATE_CARD || action === ACTIONS.MOVE_CARD) {
      const id = formData.get("id") as string;
      const listId = formData.get("listId") as string;

      pendingCardIds.add(id);

      const card = {
        id,
        listId,
        title: formData.get("title") as string,
        position: formData.get("position") as string,
      };

      const list = pendingCardsByList.get(listId);

      if (list) {
        list.push(card);
      } else {
        pendingCardsByList.set(listId, [card]);
      }
    }
  }
  return { pendingCardIds, pendingCardsByList, pendingListIds, pendingLists };
}

export function useOptimisticLists(
  lists: Route.ComponentProps["loaderData"]["board"]["lists"],
) {
  const fetchers = useFetchers();

  for (const fetcher of fetchers) {
    const formData = fetcher.formData;

    if (!formData) {
      continue;
    }

    const action = formData.get("action");

    if (action === ACTIONS.CREATE_LIST || action === ACTIONS.MOVE_LIST) {
      const { listId, title, position } = Object.fromEntries(formData) as {
        listId: string;
        title: string;
        position: string;
      };
      const newLists =
        action === ACTIONS.CREATE_LIST
          ? [
              ...lists,
              {
                title,
                position,
                id: listId,
                archived: false,
                color: "",
                cards: [],
              },
            ]
          : lists.map((list) =>
              list.id === listId ? { ...list, position } : list,
            );

      lists = newLists.sort((a, b) => sortPosition(a.position, b.position));
    }

    if (action === ACTIONS.CREATE_CARD || action === ACTIONS.MOVE_CARD) {
      const { cardId, listId, title, position } = Object.fromEntries(
        formData,
      ) as {
        cardId: string;
        listId: string;
        title: string;
        position: string;
      };

      if (action === ACTIONS.CREATE_CARD) {
        lists = lists.map((list) =>
          list.id === listId
            ? {
                ...list,
                cards: [
                  ...list.cards,
                  { listId, title, position, id: cardId, completed: false },
                ].sort((a, b) => sortPosition(a.position, b.position)),
              }
            : list,
        );
      } else {
        const card = lists
          .flatMap((list) => list.cards)
          .find((card) => card.id === cardId);

        if (!card) {
          continue;
        }

        lists = lists.map((list) => {
          if (list.id !== listId && list.id !== card?.listId) {
            return list;
          }
          const listWithoutCard = list.cards.filter(
            (card) => card.id !== cardId,
          );
          const newCards =
            list.id === listId
              ? listWithoutCard.concat([{ ...card, listId, position }])
              : listWithoutCard;
          return {
            ...list,
            cards: newCards.sort((a, b) =>
              a.position.localeCompare(b.position),
            ),
          };
        });
      }
    }
  }

  return lists;
}

export function useBoardDnd(lists: BoardLists) {
  const submit = useSubmit();
  const listsRef = useRef(lists);

  useEffect(() => {
    monitorForElements({
      canMonitor: ({ source }) =>
        source.data.type === "card" || source.data.type === "lists",
      onDrop({ location, source }) {
        const destination = location.current.dropTargets[0];

        if (!destination) {
          return;
        }

        const currentLists = listsRef.current;

        if (source.data.type === "list") {
          const sourceListId = source.data.listId;
          const targetListId = destination.data.listId;

          if (sourceListId === targetListId) {
            return;
          }

          const edge = extractClosestEdge(destination.data);
          const order = currentLists.filter((list) => list.id !== sourceListId);
          const targetIndex = order.findIndex(
            (list) => list.id === targetListId,
          );
          const insertIndex = edge === "right" ? targetIndex + 1 : targetIndex;

          const position = generateKeyBetween(
            order[insertIndex - 1]?.position ?? null,
            order[insertIndex]?.position ?? null,
          );

          const formData = new FormData();

          formData.append("action", ACTIONS.MOVE_LIST);
          formData.append("listId", sourceListId as string);
          formData.append("position", position);

          void submit(formData, { method: "POST", navigate: false });

          return;
        }

        const cardId = source.data.cardId;
        const listId = source.data.listId;
        const card = (
          currentLists.find((list) => list.id === listId)?.cards ?? []
        ).find((card) => card.id === cardId);

        if (!card) {
          return;
        }

        if (
          destination.data.type === "card" &&
          destination.data.cardId === cardId
        ) {
          return;
        }

        let targetListId: string;
        let prevPos: string | null;
        let nextPos: string | null;

        if (destination.data.type === "card") {
          targetListId = destination.data.listId as string;
          const siblings = (
            currentLists.find((list) => list.id === targetListId)?.cards ?? []
          ).filter((card) => card.id !== cardId);
          const targetIndex = siblings.findIndex(
            (card) => card.id === destination.data.cardId,
          );
          const edge = extractClosestEdge(destination.data);
          const insertIndex = edge === "bottom" ? targetIndex + 1 : targetIndex;
          prevPos = siblings[insertIndex - 1]?.position ?? null;
          nextPos = siblings[insertIndex]?.position ?? null;
        } else {
          targetListId = destination.data.listId as string;
          const siblings = (
            currentLists.find((list) => list.id === targetListId)?.cards ?? []
          ).filter((card) => card.id !== cardId);
          prevPos = siblings.at(-1)?.position ?? null;
          nextPos = null;
        }

        const position = generateKeyBetween(prevPos, nextPos);

        const formData = new FormData();

        formData.append("action", ACTIONS.MOVE_CARD);
        formData.append("cardId", cardId as string);
        formData.append("listId", targetListId);
        formData.append("position", position);

        void submit(formData, { method: "POST", navigate: false });
      },
    });
  }, [submit]);
}

const sortPosition = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
