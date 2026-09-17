import { unsafeOverflowAutoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/unsafe-overflow/element";
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { useEffect, useRef } from "react";
import { useSubmit } from "react-router";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { generateKeyBetween } from "fractional-indexing";
import { ACTIONS } from "./action";
import type { Lists } from "./types";

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
            formData.append("sourceListId", sourceListId);
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
            return;
          }

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
          formData.append("id", cardId);
          formData.append("listId", targetListId);
          formData.append("position", generateKeyBetween(prevPos, nextPos));

          void submit(formData, { method: "POST", navigate: false });
        },
      }),
    );
  }, [submit, listContainerRef]);

  return { listContainerRef };
}
