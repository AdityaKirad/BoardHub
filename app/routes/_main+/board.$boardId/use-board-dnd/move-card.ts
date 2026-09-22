import type { Lists } from "../types";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import type { DropTargetRecord } from "@atlaskit/pragmatic-drag-and-drop/types";
import type { ElementDragPayload } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { ACTIONS } from "../action";
import { generateKeyBetween } from "fractional-indexing";
import type { SubmitFunction } from "react-router";

export function moveCard(
  lists: Lists,
  {
    destination,
    source,
    submit,
  }: {
    destination: DropTargetRecord;
    source: ElementDragPayload;
    submit: SubmitFunction;
  },
) {
  const cardId = source.data.cardId as string;
  const targetListId = destination.data.listId as string;

  if (destination.data.type === "card" && destination.data.cardId === cardId) {
    return;
  }

  const siblings = (
    lists.find((l) => l.id === targetListId)?.cards ?? []
  ).filter((c) => c.id !== cardId);

  let prevPos: string | null;
  let nextPos: string | null;

  if (destination.data.type === "card") {
    const targetIndex = siblings.findIndex(
      (c) => c.id === destination.data.cardId,
    );
    const edge = extractClosestEdge(destination.data);
    const insertIndex = edge === "bottom" ? targetIndex + 1 : targetIndex;
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

  void submit(formData, { method: "POST", navigate: false, flushSync: true });
}
