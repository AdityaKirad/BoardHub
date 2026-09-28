import { unsafeOverflowAutoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/unsafe-overflow/element";
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { useEffect } from "react";
import { useSubmit } from "react-router";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import type { Lists } from "../types";
import { moveList } from "./move-list";
import { moveCard } from "./move-card";

export function useBoardDnd(
  lists: Lists,
  listContainerRef: React.RefObject<React.ComponentRef<"ul"> | null>,
) {
  const submit = useSubmit();

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

          if (source.data.type === "list") {
            moveList(lists, { destination, source, submit });
            return;
          }

          moveCard(lists, { destination, source, submit });
        },
      }),
    );
  }, [submit, listContainerRef, lists]);

  return { listContainerRef };
}
