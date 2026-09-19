import { ListActionDropdown } from "./list-action-dropdown";
import { useListContext } from "./list-context";
import { ListPin } from "./list-pin";
import { ListTitle } from "./list-title";

export function ListHeader({
  ref,
}: {
  ref?: React.RefObject<HTMLDivElement | null>;
}) {
  const { list } = useListContext();
  return (
    <div className="bg-card flex items-center gap-1 px-2 pt-2" ref={ref}>
      <ListTitle />
      {list.cards.length}
      <ListPin />
      <ListActionDropdown />
    </div>
  );
}
