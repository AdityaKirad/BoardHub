import { useBoardContext } from "../../board-context";
import { useListContext } from "../list-context";
import { ACTIONS } from "../../action";

export function MoveAllCardsInThisFormContent() {
  const { lists } = useBoardContext();
  const { list: currentList } = useListContext();
  return (
    <>
      {lists.map((list) => {
        const isCurrentList = list.id === currentList.id;
        return (
          <button
            className="focus-visible:bg-accent focus-visible:text-accent-foreground hover:bg-accent hover:text-accent-foreground px-1.5 py-2 text-left text-sm aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
            type="submit"
            name="sourceListId"
            value={list.id}
            key={list.id}
            aria-disabled={isCurrentList}>
            {list.title} {isCurrentList && "(current)"}
          </button>
        );
      })}
      <input type="hidden" name="destinationListId" value={currentList.id} />
      <input
        type="hidden"
        name="action"
        value={ACTIONS.MOVE_CARDS_IN_THIS_LIST}
      />
    </>
  );
}
