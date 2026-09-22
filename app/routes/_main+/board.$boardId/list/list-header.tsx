import { ListActionDropdown } from "./list-action-dropdown";
import { ListPin } from "./list-pin";
import { ListTitle } from "./list-title";

export function ListHeader({
  ref,
  totalCards,
}: {
  ref?: React.RefObject<HTMLDivElement | null>;
  totalCards: number;
}) {
  return (
    <div className="bg-card flex items-center gap-1 px-2 pt-2" ref={ref}>
      <ListTitle />
      {totalCards}
      <ListPin />
      <ListActionDropdown />
    </div>
  );
}
