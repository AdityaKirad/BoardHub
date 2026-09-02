import type { CardSelectType } from "~/.server/db/schema/workspace";
import { Button } from "~/components/ui/button";
import { EditIcon } from "lucide-react";
import { ListItemPreview } from "./list-item-preview";
import { ToggleCardCompletion } from "./toggle-card-completion";
import { cn } from "~/lib/utils";
import { useListItem } from "./use-list-item";
import { EditCardTitle, useEditCardTitle } from "./edit-card-title";

export function ListItem({
  listId,
  card,
  index,
}: {
  listId: string;
  card: Pick<CardSelectType, "id" | "title" | "completed">;
  index: number;
}) {
  const { closestEdge, dragging, itemRef, placeholderHeight } = useListItem({
    listId,
    index,
    cardId: card.id,
  });
  const {
    edit,
    editorRect,
    fetcher,
    formRef,
    textAreaRef,
    title,
    openEditor,
    closeEditor,
    updateTitle,
  } = useEditCardTitle(itemRef, card);

  if (dragging) {
    return <ListItemPreview completed={card.completed} title={card.title} />;
  }

  return (
    <>
      {closestEdge === "top" && placeholderHeight && (
        <CardPlaceholder height={placeholderHeight} />
      )}
      <li
        className={cn(
          "group bg-input outline-primary flex min-h-9 cursor-pointer gap-2 rounded-lg p-2 outline-2 outline-offset-1 outline-none focus-within:outline-solid hover:outline-solid focus-within:[&>span]:translate-x-0",
          { "rotate-15": dragging },
        )}
        ref={itemRef}
        data-dragging={dragging}>
        <ToggleCardCompletion cardId={card.id} completed={card.completed} />
        <span className="-translate-x-6 transition-transform duration-300 ease-out group-hover:translate-x-0">
          {title}
        </span>
        <Button
          className="ml-auto rounded opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 focus-visible:opacity-100"
          variant="outline"
          size="icon"
          type="button"
          onClick={(evt) => {
            evt.stopPropagation();
            openEditor();
          }}>
          <EditIcon />
        </Button>
      </li>
      {closestEdge === "bottom" && placeholderHeight && (
        <CardPlaceholder height={placeholderHeight} />
      )}
      {edit && editorRect && (
        <EditCardTitle
          card={card}
          editorRect={editorRect}
          fetcher={fetcher}
          formRef={formRef}
          textAreaRef={textAreaRef}
          closeEditor={closeEditor}
          updateTitle={updateTitle}
        />
      )}
    </>
  );
}

function CardPlaceholder({ height }: { height: number }) {
  return (
    <li
      className="my-1 rounded-lg border-2 border-dashed border-white/20 bg-white/5"
      style={{ height }}
      aria-hidden
    />
  );
}
