import { Button } from "~/components/ui/button";
import { EditIcon } from "lucide-react";
import { ToggleCardCompletion } from "./toggle-card-completion";
import { cn } from "~/lib/utils";
import { useListItem, type CardState } from "./use-list-item";
import { EditCardTitle, useEditCardTitle } from "./edit-card-title";
import { createPortal } from "react-dom";
import type { Card } from "../hooks";

function ListItemDisplay({
  card,
  state,
  itemRef,
}: {
  card: Card;
  state: CardState;
  itemRef?: React.RefObject<React.ComponentRef<"li"> | null>;
}) {
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
  } = useEditCardTitle(card, itemRef);
  return (
    <>
      {state.type === "is-over" && state.closestEdge === "top" && (
        <CardPlaceholder rect={state.rect} />
      )}
      <li
        className={cn(
          "group bg-background outline-primary flex cursor-pointer gap-2 rounded-lg p-2 outline-2 outline-offset-1 outline-none",
          state.type === "is-dragging"
            ? "opacity-50"
            : "focus-within:outline-solid hover:outline-solid focus-within:[&>span]:translate-x-0",
          {
            hidden: state.type === "is-dragging-and-left-self",
            "rotate-5": state.type === "preview",
          },
        )}
        ref={itemRef}
        style={
          state.type === "preview"
            ? { height: state.rect.height, width: state.rect.width }
            : {}
        }>
        <ToggleCardCompletion
          card={card}
          isPreview={state.type === "preview"}
        />
        <span
          className={
            state.type !== "preview"
              ? "-translate-x-6 transition-transform duration-300 ease-out group-hover:translate-x-0"
              : ""
          }>
          {title}
        </span>
        <Button
          className={cn("ml-auto rounded", {
            "opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 focus-visible:opacity-100":
              state.type !== "preview",
          })}
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
      {state.type === "is-over" && state.closestEdge === "bottom" && (
        <CardPlaceholder rect={state.rect} />
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

export function ListItem(card: Card) {
  const { itemRef, state } = useListItem({
    cardId: card.id,
    listId: card.listId,
  });

  return (
    <>
      <ListItemDisplay itemRef={itemRef} card={card} state={state} />
      {state.type === "preview"
        ? createPortal(
            <ListItemDisplay card={card} state={state} />,
            state.container,
          )
        : null}
    </>
  );
}

export function CardPlaceholder({ rect }: { rect: DOMRect }) {
  return (
    <li
      className="rounded-lg bg-black/40"
      style={{ height: rect.height, width: rect.width }}
      aria-hidden
    />
  );
}
