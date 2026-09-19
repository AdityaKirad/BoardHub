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

export function MoveListFormContent() {
  const { boards } = useBoardContext();
  const { list } = useListContext();
  const [selectedBoard, selectedBoardSet] = useState(boards[0]?.id);
  const params = useParams();
  const board = boards.find((board) => board.id === selectedBoard);
  const targetLists = (board?.lists ?? []).filter((l) => l.id !== list.id);

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

      <div>
        <Label>Position</Label>
        <Select
          name="position"
          key={selectedBoard}
          defaultValue={generateKeyBetween(null, targetLists[0]?.position)}>
          <SelectTrigger className="mt-2 w-full rounded">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-sm py-2" position="popper">
            {targetLists.map((list, index) => (
              <SelectItem
                className="rounded-none py-2"
                key={list.id}
                value={generateKeyBetween(
                  targetLists[index - 1]?.position,
                  list.position,
                )}>
                {index + 1}
              </SelectItem>
            ))}

            <SelectItem
              className="rounded-none py-2"
              value={generateKeyBetween(targetLists.at(-1)?.position, null)}>
              {targetLists.length + 1}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <input type="hidden" name="action" value={ACTIONS.MOVE_LIST} />
      <input type="hidden" name="listId" value={list.id} />
    </>
  );
}
