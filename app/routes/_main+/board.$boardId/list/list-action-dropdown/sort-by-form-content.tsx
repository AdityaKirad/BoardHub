import { ACTIONS } from "../../action";
import { useListContext } from "../list-context";

export function SortByFormContent() {
  const { list } = useListContext();
  return (
    <>
      <button
        className="focus-visible:bg-accent focus-visible:text-accent-foreground hover:bg-accent hover:text-accent-foreground px-1.5 py-2 text-left text-sm aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
        type="submit"
        name="sortBy"
        value="created-desc">
        Date created (newest first)
      </button>
      <button
        className="focus-visible:bg-accent focus-visible:text-accent-foreground hover:bg-accent hover:text-accent-foreground px-1.5 py-2 text-left text-sm aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
        type="submit"
        name="sortBy"
        value="created-asc">
        Date created (oldest first)
      </button>
      <button
        className="focus-visible:bg-accent focus-visible:text-accent-foreground hover:bg-accent hover:text-accent-foreground px-1.5 py-2 text-left text-sm aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
        type="submit"
        name="sortBy"
        value="title">
        Card name (alphabetically)
      </button>

      <input type="hidden" name="action" value={ACTIONS.SORT_LIST} />
      <input type="hidden" name="listId" value={list.id} />
    </>
  );
}
