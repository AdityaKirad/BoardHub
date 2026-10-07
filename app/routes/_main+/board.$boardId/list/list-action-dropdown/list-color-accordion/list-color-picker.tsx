import { CheckIcon, XIcon } from "lucide-react";
import { useRef, type KeyboardEvent } from "react";
import { LIST_COLORS_PER_ROW, listColors } from "./list-color-options";

export function ListColorPicker({
  selectedColor,
  isDefaultSelected,
  onSelectColor,
  onScheduleColor,
  onRemoveColor,
}: {
  selectedColor: string;
  isDefaultSelected: boolean;
  onSelectColor: (color: string) => void;
  onScheduleColor: (color: string) => void;
  onRemoveColor: () => void;
}) {
  const colorGroupRef = useRef<HTMLDivElement>(null);
  const removeColorRef = useRef<HTMLButtonElement>(null);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const button =
      event.target instanceof HTMLButtonElement ? event.target : null;

    if (event.key === "Tab") {
      if (button?.getAttribute("role") === "radio" && !isDefaultSelected) {
        event.preventDefault();
        removeColorRef.current?.focus();
      } else if (button === removeColorRef.current) {
        event.preventDefault();
        colorGroupRef.current
          ?.querySelector<HTMLButtonElement>('[aria-checked="true"]')
          ?.focus();
      }
      return;
    }

    const currentIndex = Number(button?.dataset.colorIndex);
    if (!button || !Number.isInteger(currentIndex)) return;

    let nextIndex: number;
    switch (event.key) {
      case "ArrowLeft":
        nextIndex =
          Math.floor(currentIndex / LIST_COLORS_PER_ROW) * LIST_COLORS_PER_ROW +
          (((currentIndex % LIST_COLORS_PER_ROW) - 1 + LIST_COLORS_PER_ROW) %
            LIST_COLORS_PER_ROW);
        break;
      case "ArrowRight":
        nextIndex =
          Math.floor(currentIndex / LIST_COLORS_PER_ROW) * LIST_COLORS_PER_ROW +
          (((currentIndex % LIST_COLORS_PER_ROW) + 1) % LIST_COLORS_PER_ROW);
        break;
      case "ArrowUp":
        nextIndex =
          (currentIndex - LIST_COLORS_PER_ROW + listColors.length) %
          listColors.length;
        break;
      case "ArrowDown":
        nextIndex = (currentIndex + LIST_COLORS_PER_ROW) % listColors.length;
        break;
      default:
        return;
    }

    event.preventDefault();
    const nextColor = listColors[nextIndex];
    if (!nextColor) return;

    onScheduleColor(nextColor.value);
    colorGroupRef.current
      ?.querySelector<HTMLButtonElement>(`[data-color-index="${nextIndex}"]`)
      ?.focus();
  }

  function handleRemoveColor() {
    onRemoveColor();
    colorGroupRef.current
      ?.querySelector<HTMLButtonElement>(
        `[data-color-index="${listColors.length - 1}"]`,
      )
      ?.focus();
  }

  return (
    <div
      aria-label="List color controls"
      className="space-y-2"
      onKeyDown={handleKeyDown}
      role="toolbar"
      tabIndex={-1}>
      <div
        aria-label="List colors"
        className="grid grid-cols-5 gap-2"
        ref={colorGroupRef}
        role="radiogroup"
        tabIndex={-1}>
        {listColors.map((color, index) => {
          const selected = selectedColor === color.value;

          return (
            <button
              key={color.value}
              type="button"
              data-color-index={index}
              title={color.name}
              aria-label={`Change list color to ${color.name}`}
              aria-checked={selected}
              role="radio"
              tabIndex={selected ? 0 : -1}
              onClick={() => onSelectColor(color.value)}
              className="focus-visible:ring-ring focus-visible:ring-offset-background relative h-10 rounded-md border border-white/20 transition outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ backgroundColor: color.value }}>
              {selected && (
                <CheckIcon className="absolute top-1/2 left-1/2 size-5 -translate-x-1/2 -translate-y-1/2 text-black" />
              )}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        disabled={isDefaultSelected}
        onClick={handleRemoveColor}
        ref={removeColorRef}
        className="border-border text-muted-foreground hover:bg-muted focus-visible:ring-ring focus-visible:ring-offset-background flex h-10 w-full items-center justify-center gap-2 rounded-md border text-sm font-medium transition outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
        <XIcon className="size-4" />
        Remove color
      </button>
    </div>
  );
}
