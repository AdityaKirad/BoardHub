import { Button } from "~/components/ui/button";
import { EditIcon } from "lucide-react";
import { ToggleCardCompletion } from "./toggle-card-completion";
import { cn } from "~/lib/utils";
import { useListItem, type CardState } from "./use-list-item";
import {
  DialogEditCardTitle,
  EditCardTitle,
  useEditCardTitle,
} from "./edit-card-title";
import { createPortal, flushSync } from "react-dom";
import type { Card } from "../hooks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import { useState } from "react";
import { DescriptionEditor } from "./description-editor";

function ListItemDisplay({
  card,
  listTitle,
  state,
  itemRef,
}: {
  card: Card;
  state: CardState;
  listTitle?: string;
  itemRef?: React.RefObject<React.ComponentRef<"li"> | null>;
}) {
  const {
    dialogTitleEdit,
    fetcher,
    floatingEdit,
    floatingEditorRect,
    inputRef,
    textAreaRef,
    title,
    closeFloatingEditor,
    dialogTitleEditSet,
    openFloatingEditor,
    updateTitle,
  } = useEditCardTitle(card, itemRef);
  const [open, openSet] = useState(false);
  return (
    <>
      {state.type === "is-over" && state.closestEdge === "top" && (
        <CardPlaceholder rect={state.rect} />
      )}
      <Dialog
        open={open}
        onOpenChange={(open) => {
          if (!open && dialogTitleEdit) {
            flushSync(() => dialogTitleEditSet(false));
          }
          openSet(open);
        }}>
        <DialogTrigger asChild>
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
              className={cn("ml-auto rounded-full", {
                "opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 focus-visible:opacity-100":
                  state.type === "idle",
              })}
              variant="outline"
              size="icon"
              type="button"
              onClick={(evt) => {
                evt.stopPropagation();
                openFloatingEditor();
              }}>
              <EditIcon />
            </Button>
          </li>
        </DialogTrigger>
        <DialogContent className="top-1/20 bottom-1/10 flex translate-y-0 flex-col sm:max-w-[min(var(--container-6xl),calc(100%-2rem))]">
          <DialogHeader>{listTitle}</DialogHeader>
          <Separator />
          <div className="flex flex-[.9] overflow-y-auto">
            <div className="flex flex-3/5 flex-col gap-4">
              <div className="flex items-center gap-2">
                <ToggleCardCompletion card={card} isEditing />
                <DialogEditCardTitle
                  dialogTitleEdit={dialogTitleEdit}
                  fetcher={fetcher}
                  inputRef={inputRef}
                  title={title}
                  onTitleButtonClick={() => dialogTitleEditSet(true)}
                  updateTitle={updateTitle}
                />
              </div>
              <DescriptionEditor />
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {state.type === "is-over" && state.closestEdge === "bottom" && (
        <CardPlaceholder rect={state.rect} />
      )}
      {floatingEdit && floatingEditorRect && (
        <EditCardTitle
          card={card}
          editorRect={floatingEditorRect}
          fetcher={fetcher}
          textAreaRef={textAreaRef}
          closeFloatingEditor={closeFloatingEditor}
          updateTitle={updateTitle}
        />
      )}
    </>
  );
}

export function ListItem({
  card,
  listTitle,
}: {
  card: Card;
  listTitle: string;
}) {
  const { itemRef, state } = useListItem({
    cardId: card.id,
    listId: card.listId,
  });

  return (
    <>
      <ListItemDisplay
        itemRef={itemRef}
        card={card}
        listTitle={listTitle}
        state={state}
      />
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
