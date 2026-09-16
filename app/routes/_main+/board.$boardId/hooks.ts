import { useEffect, useRef } from "react";
import { useFetchers, useSubmit } from "react-router";
import { ACTIONS } from "./action";
import type { Route } from "./+types/route";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { generateKeyBetween } from "fractional-indexing";
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { unsafeOverflowAutoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/unsafe-overflow/element";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";

type Lists = Route.ComponentProps["loaderData"]["board"]["lists"];
export type List = Lists[number];
export type Cards = List["cards"];
export type Card = Cards[number];

export function useOptimisticLists(lists: Lists) {
  const fetchers = useFetchers();

  for (const fetcher of fetchers) {
    const formData = fetcher.formData;

    if (!formData) {
      continue;
    }

    const action = formData.get("action");

    if (
      action === ACTIONS.COPY_LIST ||
      action === ACTIONS.CREATE_LIST ||
      action === ACTIONS.MOVE_LIST
    ) {
      const { listId, newListId, title, position } = Object.fromEntries(
        formData,
      ) as {
        listId: string;
        newListId: string;
        title: string;
        position: string;
      };
      const newLists =
        action === ACTIONS.COPY_LIST
          ? [
              ...lists,
              {
                ...lists.find((list) => list.id === listId),
                title,
                position,
                id: newListId,
              },
            ]
          : action === ACTIONS.CREATE_LIST
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

export function useBoardDnd(
  lists: Lists,
  listContainerRef: React.RefObject<React.ComponentRef<"ul"> | null>,
) {
  const submit = useSubmit();
  const listsRef = useRef(lists);

  useEffect(() => {
    const element = listContainerRef.current;

    if (!element) {
      return;
    }

    return combine(
      autoScrollForElements({
        element,
        getConfiguration: () => ({ maxScrollSpeed: "standard" }),
        canScroll: ({ source }) => source.data.type === "card",
      }),
      unsafeOverflowAutoScrollForElements({
        element,
        getConfiguration: () => ({ maxScrollSpeed: "standard" }),
        canScroll: ({ source }) => source.data.type === "card",
        getOverflow: () => ({
          forLeftEdge: {
            left: 1000,
          },
          forRightEdge: {
            right: 1000,
          },
        }),
      }),
      monitorForElements({
        canMonitor: ({ source }) =>
          source.data.type === "card" || source.data.type === "list",
        onDrop({ source, location }) {
          const destination = location.current.dropTargets[0];

          if (!destination) {
            return;
          }

          const currentLists = listsRef.current;

          if (source.data.type === "list") {
            const sourceListId = source.data.listId as string;
            const targetListId = destination.data.listId as string;

            if (sourceListId === targetListId) {
              return;
            }

            const edge = extractClosestEdge(destination.data);
            const order = currentLists.filter((l) => l.id !== sourceListId);
            const targetIndex = order.findIndex((l) => l.id === targetListId);
            const insertIndex =
              edge === "right" ? targetIndex + 1 : targetIndex;
            const position = generateKeyBetween(
              order[insertIndex - 1]?.position ?? null,
              order[insertIndex]?.position ?? null,
            );

            const formData = new FormData();

            formData.append("action", ACTIONS.MOVE_LIST);
            formData.append("listId", sourceListId);
            formData.append("position", position);

            void submit(formData, { method: "POST", navigate: false });
            return;
          }

          const cardId = source.data.cardId as string;
          const targetListId = destination.data.listId as string;

          if (
            destination.data.type === "card" &&
            destination.data.cardId === cardId
          ) {
            console.log("no op gurad", { data: destination.data, cardId });
            return;
          }

          console.log("operation", { data: destination.data, cardId });

          const siblings = (
            currentLists.find((l) => l.id === targetListId)?.cards ?? []
          ).filter((c) => c.id !== cardId);

          let prevPos: string | null;
          let nextPos: string | null;

          if (destination.data.type === "card") {
            const targetIndex = siblings.findIndex(
              (c) => c.id === destination.data.cardId,
            );
            const edge = extractClosestEdge(destination.data);
            const insertIndex =
              edge === "bottom" ? targetIndex + 1 : targetIndex;
            prevPos = siblings[insertIndex - 1]?.position ?? null;
            nextPos = siblings[insertIndex]?.position ?? null;
          } else {
            prevPos = siblings.at(-1)?.position ?? null;
            nextPos = null;
          }

          const formData = new FormData();

          formData.append("action", ACTIONS.MOVE_CARD);
          formData.append("cardId", cardId);
          formData.append("listId", targetListId);
          formData.append("position", generateKeyBetween(prevPos, nextPos));

          void submit(formData, { method: "POST", navigate: false });
        },
      }),
    );
  }, [submit, listContainerRef]);

  return { listContainerRef };
}

const sortPosition = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
