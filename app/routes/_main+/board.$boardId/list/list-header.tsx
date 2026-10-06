import { cn } from "~/lib/utils";
import { ListActionDropdown } from "./list-action-dropdown";
import { ListCollapse } from "./list-collapse";
import { useListContext } from "./list-context";
import { ListPin } from "./list-pin";
import { ListTitle } from "./list-title";

export function ListHeader({
  ref,
  totalCards,
}: {
  ref?: React.RefObject<HTMLDivElement | null>;
  totalCards: number;
}) {
  const { list } = useListContext();

  return (
    <div
      className={cn("bg-card flex items-center gap-1 px-2 pt-2", {
        "flex-col pb-2": list.collapsed,
      })}
      ref={ref}>
      <ListTitle />
      <span className={list.collapsed ? "order-2" : ""}>{totalCards}</span>
      <ListCollapse />
      <ListPin />
      <ListActionDropdown />
    </div>
  );
}
