import { useState } from "react";
import { useBoardContext } from "../../board-context";
import { useListContext } from "../list-context";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { generateKeyBetween } from "fractional-indexing";
import { ACTIONS } from "../../action";
import { useParams } from "react-router";
import { cn } from "~/lib/utils";
import type { List } from "../../types";

export function MoveListFormContent() {
  const params = useParams();
  const { boards } = useBoardContext();
  const { list } = useListContext();
  const [selectedBoard, selectedBoardSet] = useState(params.boardId);

  const board = boards.find((board) => board.id === selectedBoard);

  const activeLists = (board?.lists ?? []).filter((l) => !l.archived);

  return (
    <>
      <div>
        <Label>Board</Label>
        <Select
          name="boardId"
          value={selectedBoard}
          onValueChange={selectedBoardSet}>
          <SelectTrigger className="mt-2 w-full rounded">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-sm py-2" position="popper">
            {boards.map((board) => {
              const isCurrentBoard = board.id === params.boardId;
              return (
                <SelectItem
                  key={board.id}
                  className={cn("rounded-none py-2", {
                    "flex-col items-start": isCurrentBoard,
                  })}
                  value={board.id}>
                  <p>{board.title}</p>
                  <p>{isCurrentBoard && "(current)"}</p>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <PositionSelectMenu
        activeLists={activeLists}
        selectedBoard={selectedBoard}
      />

      <input type="hidden" name="action" value={ACTIONS.MOVE_LIST} />
      <input type="hidden" name="listId" value={list.id} />
    </>
  );
}

function PositionSelectMenu({
  activeLists,
  selectedBoard,
}: {
  activeLists: Pick<List, "id" | "position" | "archived">[];
  selectedBoard: string | undefined;
}) {
  const params = useParams();
  const { list } = useListContext();

  const targetLists = activeLists.filter((l) => l.id !== list.id);

  const positionOptions = Array.from(
    { length: targetLists.length + 1 },
    (_, idx) => ({
      label: idx + 1,
      value: generateKeyBetween(
        targetLists[idx - 1]?.position,
        targetLists[idx]?.position,
      ),
    }),
  );

  const currentListIndex = activeLists.findIndex((l) => l.id === list.id);

  const defaultPosition =
    selectedBoard === params.boardId && currentListIndex !== -1
      ? positionOptions[currentListIndex]?.value
      : positionOptions[0]?.value;
  return (
    <div>
      <Label>Position</Label>
      <Select
        name="position"
        key={selectedBoard}
        defaultValue={defaultPosition}>
        <SelectTrigger className="mt-2 w-full rounded">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-sm py-2" position="popper">
          {positionOptions.map((position) => (
            <SelectItem
              className="rounded-none py-2"
              key={position.value}
              value={position.value}>
              {position.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
