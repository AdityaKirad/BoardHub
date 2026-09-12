import {
  draggable,
  dropTargetForElements,
  type ElementDragPayload,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect, useRef, useState } from "react";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  attachClosestEdge,
  extractClosestEdge,
  type Edge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { preserveOffsetOnSource } from "@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source";
import { isShallowEqual } from "~/lib/utils";
import type { DropTargetRecord } from "@atlaskit/pragmatic-drag-and-drop/types";

export type CardState =
  | { type: "idle" }
  | { type: "is-dragging" }
  | { type: "is-dragging-and-left-self" }
  | {
      type: "is-over";
      closestEdge: Edge;
      rect: DOMRect;
    }
  | {
      type: "preview";
      container: HTMLElement;
      rect: DOMRect;
    };

export function useListItem({
  cardId,
  listId,
}: {
  cardId: string;
  listId: string;
}) {
  const itemRef = useRef<React.ComponentRef<"li">>(null);

  const [state, stateSet] = useState<CardState>({ type: "idle" });

  useEffect(() => {
    const element = itemRef.current;

    if (!element) {
      return;
    }

    const rect = element.getBoundingClientRect();

    function setIsCardOver({
      self,
      source,
    }: {
      self: DropTargetRecord;
      source: ElementDragPayload;
    }) {
      const sourceCardId = source.data.cardId;

      if (sourceCardId === cardId) {
        return;
      }

      const closestEdge = extractClosestEdge(self.data);
      if (!closestEdge) {
        return;
      }

      const proposed: Extract<CardState, { type: "is-over" }> = {
        closestEdge,
        type: "is-over",
        rect: source.data.rect as DOMRect,
      };

      stateSet((prev) => (isShallowEqual(prev, proposed) ? prev : proposed));
    }

    return combine(
      draggable({
        element,
        getInitialData: () => ({
          cardId,
          listId,
          rect,
          type: "card",
        }),
        onGenerateDragPreview: ({ location, nativeSetDragImage }) =>
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: preserveOffsetOnSource({
              element,
              input: location.current.input,
            }),
            render: ({ container }) =>
              stateSet({ container, rect, type: "preview" }),
          }),
        onDragStart: () => stateSet({ type: "is-dragging" }),
        onDrop: () => stateSet({ type: "idle" }),
      }),
      dropTargetForElements({
        element,
        getIsSticky: () => true,
        canDrop: ({ source }) => source.data.type === "card",
        getData: ({ element, input }) =>
          attachClosestEdge(
            { cardId, listId, type: "card" },
            { element, input, allowedEdges: ["top", "bottom"] },
          ),
        onDragEnter: setIsCardOver,
        onDrag: setIsCardOver,
        onDragLeave({ source }) {
          if (source.data.cardId === cardId) {
            stateSet({ type: "is-dragging-and-left-self" });
            return;
          }
          stateSet({ type: "idle" });
        },
        onDrop: () => stateSet({ type: "idle" }),
      }),
    );
  }, [cardId, listId]);

  return {
    itemRef,
    state,
  };
}
