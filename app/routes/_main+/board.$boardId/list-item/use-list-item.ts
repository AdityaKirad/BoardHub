import {
  attachClosestEdge,
  extractClosestEdge,
  type Edge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect, useRef, useState } from "react";

export function useListItem({
  listId,
  cardId,
  index,
}: {
  listId: string;
  cardId: string;
  index: number;
}) {
  const itemRef = useRef<React.ComponentRef<"li">>(null);
  const [dragging, draggingSet] = useState(false);
  const [closestEdge, closestEdgeSet] = useState<Edge | null>(null);
  const [placeholderHeight, placeholderHeightSet] = useState<number | null>(
    null,
  );

  useEffect(() => {
    const element = itemRef.current;

    if (!element) {
      return;
    }

    return combine(
      draggable({
        element,
        getInitialData: () => ({
          cardId,
          listId,
          index,
          type: "card",
          height: element.getBoundingClientRect().height,
        }),
        onDragStart: () => draggingSet(true),
        onDrop: () => draggingSet(false),
      }),
      dropTargetForElements({
        element,
        canDrop: ({ source }) => source.data.type === "card",
        getData: ({ element, input }) =>
          attachClosestEdge(
            { cardId, listId, index, type: "card" },
            { element, input, allowedEdges: ["top", "bottom"] },
          ),
        onDrag({ self, source }) {
          closestEdgeSet(extractClosestEdge(self.data));
          placeholderHeightSet(source.data.height as number);
        },
        onDragLeave() {
          closestEdgeSet(null);
          placeholderHeightSet(null);
        },
        onDrop() {
          closestEdgeSet(null);
          placeholderHeightSet(null);
        },
      }),
    );
  }, [cardId, listId, index]);

  return {
    closestEdge,
    dragging,
    itemRef,
    placeholderHeight,
  };
}
