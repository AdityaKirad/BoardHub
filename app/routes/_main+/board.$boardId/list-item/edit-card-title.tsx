import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { useOutsideClick } from "~/hooks/use-outside-click";
import { useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import { useFetcher, type FetcherWithComponents } from "react-router";
import { ACTIONS } from "../action";
import type { Card } from "../types";

type CardTitleProps = Pick<Card, "id" | "title">;

export function useEditCardTitle(
  card: CardTitleProps,
  itemRef?: React.RefObject<React.ComponentRef<"li"> | null>,
) {
  const fetcher = useFetcher();
  const formRef = useRef<React.ComponentRef<typeof fetcher.Form>>(null);
  const textAreaRef = useRef<React.ComponentRef<typeof Textarea>>(null);
  const [edit, editSet] = useState(false);
  const [editorRect, editorRectSet] = useState<{
    left: number;
    top: number;
    width: number;
  } | null>(null);

  let title = card.title;

  if (fetcher.formData?.has("title")) {
    title = fetcher.formData.get("title") as string;
  }

  const closeEditor = () => editSet(false);

  function openEditor() {
    const rect = itemRef?.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    const { left, top, width } = rect;

    editorRectSet({ left, top, width });
    flushSync(() => editSet(true));
    textAreaRef.current?.focus();
  }

  function updateTitle() {
    const currentValue = textAreaRef.current?.value;

    if (!currentValue) {
      return;
    }

    if (currentValue !== card.title) {
      closeEditor();
    }

    const formData = new FormData();

    formData.append("action", ACTIONS.UPDATE_CARD_TITLE);
    formData.append("title", currentValue);
    formData.append("id", card.id);

    void fetcher.submit(formData, {
      method: "POST",
      flushSync: true,
    });

    closeEditor();
  }

  useOutsideClick(formRef, closeEditor);

  return {
    edit,
    editorRect,
    fetcher,
    formRef,
    textAreaRef,
    title,
    openEditor,
    closeEditor,
    updateTitle,
  };
}

export function EditCardTitle<T>({
  card,
  editorRect,
  fetcher,
  formRef,
  textAreaRef,
  closeEditor,
  updateTitle,
}: {
  card: CardTitleProps;
  editorRect: Pick<DOMRect, "left" | "top" | "width">;
  fetcher: FetcherWithComponents<T>;
  formRef: React.RefObject<HTMLFormElement | null>;
  textAreaRef: React.RefObject<React.ComponentRef<typeof Textarea> | null>;
  closeEditor: () => void;
  updateTitle: () => void;
}) {
  return createPortal(
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
        onSubmit={(evt) => {
          evt.preventDefault();
          updateTitle();
        }}>
        <Textarea
          className="bg-input min-h-24 resize-none border-none focus-visible:ring-0"
          name="title"
          ref={textAreaRef}
          defaultValue={card.title}
          onKeyDown={(evt) => {
            if (evt.key === "Escape") {
              evt.preventDefault();
              closeEditor();
            }
            if (evt.key === "Enter") {
              evt.preventDefault();
              updateTitle();
            }
          }}
        />
        <Button type="submit">Save</Button>
      </fetcher.Form>
    </>,
    document.body,
  );
}
