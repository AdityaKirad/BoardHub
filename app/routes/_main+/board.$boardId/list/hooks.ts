import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
  type ElementDragPayload,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { generateKeyBetween } from "fractional-indexing";
import { useEffect, useRef, useState } from "react";
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { unsafeOverflowAutoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/unsafe-overflow/element";
import {
  type DragLocationHistory,
  type DropTargetRecord,
} from "@atlaskit/pragmatic-drag-and-drop/types";
import { preserveOffsetOnSource } from "@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { isShallowEqual } from "~/lib/utils";
import {
  attachClosestEdge,
  extractClosestEdge,
  type Edge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import type { Cards } from "../hooks";

export type ListState =
  | { type: "idle" }
  | { type: "is-dragging" }
  | { type: "is-column-over"; closestEdge: Edge; rect: DOMRect }
  | { type: "is-card-over"; isOverChildCard: boolean; rect: DOMRect }
  | { type: "preview"; container: HTMLElement; rect: DOMRect };

export function useCreateCard(
  cards: Cards,
  cardContainerRef?: React.RefObject<React.ComponentRef<"ul"> | null>,
) {
  const [createIndex, createIndexSet] = useState<number | null>(null);

  const createPosition =
    createIndex === null
      ? null
      : generateKeyBetween(
          cards[createIndex - 1]?.position ?? null,
          cards[createIndex]?.position ?? null,
        );

  const closeCreateCard = () => createIndexSet(null);

  const scrollToNewCardForm = () =>
    cardContainerRef?.current &&
    (cardContainerRef.current.scrollTop =
      cardContainerRef.current.scrollHeight);

  const openCreateCard = (index: number) => createIndexSet(index);

  function openCreateCardAtEnd() {
    openCreateCard(cards.length);
    scrollToNewCardForm();
  }

  function handleNewCard() {
    createIndexSet((prev) => (prev ?? 0) + 1);
    scrollToNewCardForm();
  }

  return {
    createIndex,
    createPosition,
    closeCreateCard,
    handleNewCard,
    openCreateCard,
    openCreateCardAtEnd,
  };
}

export function useListDnd(listId: string) {
  const cardContainerRef = useRef<React.ComponentRef<"ul">>(null);
  const headerRef = useRef<React.ComponentRef<"div">>(null);
  const listRef = useRef<React.ComponentRef<"li">>(null);

  const [state, stateSet] = useState<ListState>({ type: "idle" });

  useEffect(() => {
    const cardContainer = cardContainerRef.current;
    const header = headerRef.current;
    const list = listRef.current;

    if (!cardContainer || !header || !list) {
      return;
    }

    const rect = list.getBoundingClientRect();

    function setIsCardOver({
      data,
      location,
    }: {
      data: Record<string, unknown>;
      location: DragLocationHistory;
    }) {
      const dropTarget = location.current.dropTargets[0];
      const isOverChildCard = dropTarget?.data.type === "card";

      const proposed: ListState = {
        isOverChildCard,
        type: "is-card-over",
        rect: data.rect as DOMRect,
      };

      stateSet((prev) => (isShallowEqual(prev, proposed) ? prev : proposed));
    }

    function setIsColumnOver({
      self,
      source,
    }: {
      self: DropTargetRecord;
      source: ElementDragPayload;
    }) {
      if (source.data.type !== "list" || source.data.listId === listId) {
        return;
      }
      const closestEdge = extractClosestEdge(self.data);
      if (!closestEdge) {
        return;
      }
      const proposed = {
        closestEdge,
        type: "is-column-over",
        rect: source.data.rect as DOMRect,
      } as const;

      stateSet((prev) => (isShallowEqual(prev, proposed) ? prev : proposed));
    }

    return combine(
      draggable({
        element: header,
        getInitialData: () => ({
          listId,
          rect,
          type: "list",
        }),
        onGenerateDragPreview({ location, source, nativeSetDragImage }) {
          if (source.data.type !== "list") {
            return;
          }
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: preserveOffsetOnSource({
              element: header,
              input: location.current.input,
            }),
            render: ({ container }) =>
              stateSet({ container, rect, type: "preview" }),
          });
        },
        onDragStart: () => stateSet({ type: "is-dragging" }),
        onDrop: () => stateSet({ type: "idle" }),
      }),
      dropTargetForElements({
        element: list,
        getIsSticky: () => true,
        canDrop: ({ source }) =>
          source.data.type === "card" || source.data.type === "list",
        getData: ({ element, input }) =>
          attachClosestEdge(
            { listId, type: "list" },
            { element, input, allowedEdges: ["left", "right"] },
          ),
        onDragStart({ location, source }) {
          if (source.data.type === "card") {
            setIsCardOver({ location, data: source.data });
          }
        },
        onDragEnter({ location, self, source }) {
          if (source.data.type === "card") {
            setIsCardOver({ location, data: source.data });
            return;
          }
          setIsColumnOver({ self, source });
        },
        onDrag: setIsColumnOver,
        onDragLeave({ source }) {
          if (source.data.type === "list" && source.data.listId === listId) {
            return;
          }
          stateSet({ type: "idle" });
        },
        onDropTargetChange({ location, self, source }) {
          if (source.data.type === "card") {
            setIsCardOver({ location, data: source.data });
            return;
          }
          setIsColumnOver({ self, source });
        },
        onDrop: () => stateSet({ type: "idle" }),
      }),
      autoScrollForElements({
        element: cardContainer,
        getConfiguration: () => ({ maxScrollSpeed: "standard" }),
        canScroll: ({ source }) => source.data.type === "card",
      }),
      unsafeOverflowAutoScrollForElements({
        element: cardContainer,
        getConfiguration: () => ({ maxScrollSpeed: "standard" }),
        canScroll: ({ source }) => source.data.type === "card",
        getOverflow: () => ({
          forTopEdge: {
            top: 1000,
          },
          forBottomEdge: {
            bottom: 1000,
          },
        }),
      }),
    );
  }, [listId]);

  return {
    cardContainerRef,
    headerRef,
    listRef,
    state,
  };
}
