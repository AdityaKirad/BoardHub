import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { generateKeyBetween } from "fractional-indexing";
import { ACTIONS } from "../action";
import type { ElementDragPayload } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import type { DropTargetRecord } from "@atlaskit/pragmatic-drag-and-drop/types";
import type { Lists } from "../types";
import type { SubmitFunction } from "react-router";

export function moveList(
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
  const sourceListId = source.data.listId as string;
  const targetListId = destination.data.listId as string;

  if (sourceListId === targetListId) {
    return;
  }

  const edge = extractClosestEdge(destination.data);
  const order = lists.filter((l) => l.id !== sourceListId);
  const targetIndex = order.findIndex((l) => l.id === targetListId);
  const insertIndex = edge === "right" ? targetIndex + 1 : targetIndex;
  const position = generateKeyBetween(
    order[insertIndex - 1]?.position ?? null,
    order[insertIndex]?.position ?? null,
  );

  const formData = new FormData();

  formData.append("action", ACTIONS.MOVE_LIST);
  formData.append("listId", sourceListId);
  formData.append("position", position);

  void submit(formData, { method: "POST", navigate: false });
}
