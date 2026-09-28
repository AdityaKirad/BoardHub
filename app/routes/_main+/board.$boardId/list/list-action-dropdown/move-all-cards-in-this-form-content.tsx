import { useBoardContext } from "../../board-context";
import { useListContext } from "../list-context";
import { ACTIONS } from "../../action";
import { DropdownMenuItem } from "~/components/ui/dropdown-menu";
import { useSubmit } from "react-router";

export function MoveAllCardsInThisFormContent() {
  const { lists } = useBoardContext();
  const { list: currentList } = useListContext();
  const submit = useSubmit();

  return lists.map((list) => {
    const isCurrentList = list.id === currentList.id;
    return (
      <DropdownMenuItem
        key={list.id}
        disabled={isCurrentList}
        onSelect={() => {
          const formData = new FormData();

          formData.append("action", ACTIONS.MOVE_CARDS_IN_THIS_LIST);
          formData.append("sourceListId", currentList.id);
          formData.append("destinationListId", list.id);

          void submit(formData, {
            method: "POST",
            navigate: false,
          });
        }}>
        {list.title} {isCurrentList && "(current)"}
      </DropdownMenuItem>
    );
  });
}
