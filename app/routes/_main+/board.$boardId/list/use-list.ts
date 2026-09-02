import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import type { CardSelectType } from "~/.server/db/schema/workspace";
import { generateKeyBetween } from "fractional-indexing";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  attachClosestEdge,
  extractClosestEdge,
  type Edge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";

type ListCard = Omit<CardSelectType, "description" | "createdAt" | "updatedAt">;

export function useList({
  listId,
  cards,
}: {
  listId: string;
  cards: ListCard[];
}) {
  const listRef = useRef<React.ComponentRef<"li">>(null);
  const [isDragging, isDraggingSet] = useState(false);
  const [isDropTarget, isDropTargetSet] = useState(false);
  const [closestEdge, closestEdgeSet] = useState<Edge | null>(null);
  const [createIndex, createIndexSet] = useState<number | null>(null);
  const [placeholderHeight, placeholderHeightSet] = useState<number | null>(
    null,
  );

  const createPosition =
    createIndex === null
      ? null
      : generateKeyBetween(
          cards[createIndex - 1]?.position ?? null,
          cards[createIndex]?.position ?? null,
        );

  const closeCreateCard = () => createIndexSet(null);

  const scrollToNewCardForm = () =>
    listRef.current &&
    (listRef.current.scrollTop = listRef.current.scrollHeight);

  const openCreateCard = (index: number) =>
    flushSync(() => createIndexSet(index));

  function openCreateCardAtEnd() {
    openCreateCard(cards.length);
    scrollToNewCardForm();
  }

  function handleNewCard() {
    createIndexSet((prev) => (prev ?? 0) + 1);
    scrollToNewCardForm();
  }

  useEffect(() => {
    const element = listRef.current;

    if (!element) {
      return;
    }

    return combine(
      draggable({
        element,
        getInitialData: () => ({
          listId,
          type: "list",
          height: element.getBoundingClientRect().height,
        }),
        onDragStart: () => isDraggingSet(true),
        onDrop: () => isDraggingSet(false),
      }),
      dropTargetForElements({
        element,
        canDrop: ({ source }) =>
          source.data.type === "card" || source.data.type === "list",
        getData: ({ element, input }) =>
          attachClosestEdge(
            { listId, type: "list" },
            { element, input, allowedEdges: ["left", "right"] },
          ),
        onDrag({ self, source }) {
          closestEdgeSet(
            source.data.type === "list" ? extractClosestEdge(self.data) : null,
          );
          placeholderHeightSet(
            source.data.type === "list" ? (source.data.height as number) : null,
          );
        },
        onDragEnter({ self, source }) {
          isDropTargetSet(true);
          closestEdgeSet(
            source.data.type === "list" ? extractClosestEdge(self.data) : null,
          );
          placeholderHeightSet(
            source.data.type === "list" ? (source.data.height as number) : null,
          );
        },
        onDragLeave() {
          isDropTargetSet(false);
          closestEdgeSet(null);
          placeholderHeightSet(null);
        },
        onDrop() {
          isDropTargetSet(false);
          closestEdgeSet(null);
          placeholderHeightSet(null);
        },
      }),
    );
  }, [listId]);

  return {
    closestEdge,
    createIndex,
    createPosition,
    isDragging,
    isDropTarget,
    listRef,
    placeholderHeight,
    handleNewCard,
    closeCreateCard,
    openCreateCard,
    openCreateCardAtEnd,
  };
}
