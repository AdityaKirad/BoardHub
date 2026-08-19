import type { CardSelectType } from "~/.server/db/schema/workspace";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { useOutsideClick } from "~/hooks/use-outside-click";
import { CircleCheckIcon, CircleIcon, EditIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import { useFetcher } from "react-router";
import { ACTIONS } from "./action";

interface EditorRect {
  left: number;
  top: number;
  width: number;
}

export function ListItem({
  card,
}: {
  card: Pick<CardSelectType, "id" | "title" | "completed">;
}) {
  const fetcher = useFetcher();

  const [edit, editSet] = useState(false);
  const [editorRect, editorRectSet] = useState<EditorRect | null>(null);

  const itemRef = useRef<React.ComponentRef<"li">>(null);
  const formRef = useRef<React.ComponentRef<typeof fetcher.Form>>(null);
  const textAreaRef = useRef<React.ComponentRef<typeof Textarea>>(null);

  useOutsideClick(formRef, () => {
    if (edit) {
      editSet(false);
    }
  });

  return (
    <>
      <li
        className="group bg-input outline-primary flex min-h-9 cursor-pointer gap-2 rounded-lg p-2 outline-2 outline-offset-1 outline-none focus-within:outline-solid hover:outline-solid focus-within:[&>span]:translate-x-0"
        ref={itemRef}>
        <ToggleCardCompletion cardId={card.id} completed={card.completed} />
        <span className="-translate-x-6 transition-transform duration-300 ease-out group-hover:translate-x-0">
          {card.title}
        </span>
        <Button
          className="ml-auto rounded opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 focus-visible:opacity-100"
          variant="outline"
          size="icon"
          type="button"
          onClick={(evt) => {
            evt.stopPropagation();

            const rect = itemRef.current?.getBoundingClientRect();

            if (!rect) {
              return;
            }

            const { left, top, width } = rect;

            editorRectSet({
              left,
              top,
              width,
            });

            flushSync(() => editSet(true));
            textAreaRef.current?.focus();
          }}>
          <EditIcon />
        </Button>
      </li>

      {edit &&
        editorRect &&
        createPortal(
          <>
            <div className="bg-background/60 fixed inset-0 z-50" />
            <fetcher.Form
              className="fixed z-50 space-y-2"
              method="POST"
              ref={formRef}
              style={{
                left: editorRect.left,
                top: editorRect.top,
                width: editorRect.width,
              }}
              onSubmit={() => editSet(false)}>
              <input type="hidden" name="cardId" value={card.id} />
              <input
                type="hidden"
                name="action"
                value={ACTIONS.UPDATE_CARD_TITLE}
              />
              <Textarea
                className="bg-input min-h-24 resize-none border-none focus-visible:ring-0"
                name="title"
                ref={textAreaRef}
                defaultValue={card.title}
                onKeyDown={(evt) => {
                  if (evt.key === "Escape") {
                    evt.preventDefault();
                    editSet(false);
                  }
                }}
              />
              <Button type="submit">Save</Button>
            </fetcher.Form>
          </>,
          document.body,
        )}
    </>
  );
}

function ToggleCardCompletion({
  cardId,
  completed,
}: {
  cardId: string;
  completed: boolean;
}) {
  const fetcher = useFetcher();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [pending, pendingSet] = useState<boolean | null>(null);
  const [prevFetcherState, prevFetcherStateSet] = useState(fetcher.state);

  const optimisticCompleted = pending ?? completed;

  if (prevFetcherState !== fetcher.state) {
    prevFetcherStateSet(fetcher.state);
    if (fetcher.state === "idle" && pending !== null) {
      pendingSet(null);
    }
  }

  useEffect(() => () => clearTimeout(timeoutRef.current), []);
  return (
    <button
      className="opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 focus-visible:opacity-100"
      title={optimisticCompleted ? "Mark as incomplete" : "Mark as complete"}
      onClick={() => {
        const next = !optimisticCompleted;
        pendingSet(next);

        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          if (next === completed) {
            pendingSet(null);
            return;
          }

          const formData = new FormData();

          formData.append("action", ACTIONS.TOGGLE_CARD_COMPLETION);
          formData.append("cardId", cardId);
          formData.append("completed", String(next));

          void fetcher.submit(formData, { method: "POST" });
        }, 400);
      }}>
      {optimisticCompleted ? (
        <CircleCheckIcon width={16} height={16} />
      ) : (
        <CircleIcon width={16} height={16} />
      )}
    </button>
  );
}
