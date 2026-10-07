import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { DropdownMenuItem } from "~/components/ui/dropdown-menu";
import { useListContext } from "../../list-context";
import { ListColorPicker } from "./list-color-picker";
import { useListColorPicker } from "./use-list-color-picker";

export function ListColorAccordion() {
  const { list, onOptimisticColorChange } = useListContext();
  const {
    isDefaultSelected,
    selectedColor,
    removeColor,
    scheduleColor,
    selectColor,
  } = useListColorPicker({
    listId: list.id,
    color: list.color,
    onOptimisticColorChange,
  });

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="list-color">
        <DropdownMenuItem asChild onSelect={(event) => event.preventDefault()}>
          <AccordionTrigger className="rounded-none px-2">
            Change list color
          </AccordionTrigger>
        </DropdownMenuItem>
        <AccordionContent className="px-2 pb-0">
          <ListColorPicker
            selectedColor={selectedColor}
            isDefaultSelected={isDefaultSelected}
            onSelectColor={selectColor}
            onScheduleColor={scheduleColor}
            onRemoveColor={removeColor}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
