import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import { useFetcher, type FetcherWithComponents } from "react-router";
import { ACTIONS } from "../action";
import type { Card } from "../hooks";
import { Input } from "~/components/ui/input";

type CardTitleProps = Pick<Card, "id" | "title">;

export function useEditCardTitle(
  card: CardTitleProps,
  itemRef?: React.RefObject<React.ComponentRef<"li"> | null>,
) {
  const fetcher = useFetcher();

  const inputRef = useRef<React.ComponentRef<typeof Input>>(null);
  const textAreaRef = useRef<React.ComponentRef<typeof Textarea>>(null);

  const [floatingEdit, floatingEditSet] = useState(false);
  const [dialogTitleEdit, dialogTitleEditSet] = useState(false);
  const [floatingEditorRect, floatingEditorRectSet] = useState<{
    left: number;
    top: number;
    width: number;
  } | null>(null);

  let title = card.title;

  if (fetcher.formData?.has("title")) {
    title = fetcher.formData.get("title") as string;
  }

  function closeFloatingEditor() {
    floatingEditSet(false);
    floatingEditorRectSet(null);
  }

  function openFloatingEditor() {
    const rect = itemRef?.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    const { left, top, width } = rect;

    floatingEditorRectSet({ left, top, width });
    flushSync(() => floatingEditSet(true));
    textAreaRef.current?.focus();
  }

  function updateTitle() {
    const currentValue = textAreaRef.current?.value ?? inputRef.current?.value;

    if (!currentValue) {
      return;
    }

    if (currentValue !== card.title) {
      return;
    }

    const formData = new FormData();

    formData.append("action", ACTIONS.UPDATE_CARD_TITLE);
    formData.append("title", currentValue);
    formData.append("cardId", card.id);

    void fetcher.submit(formData, {
      method: "POST",
      flushSync: true,
    });

    closeFloatingEditor();
    dialogTitleEditSet(false);
  }

  return {
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
  };
}

export function EditCardTitle<T>({
  card,
  editorRect,
  fetcher,
  textAreaRef,
  closeFloatingEditor,
  updateTitle,
}: {
  card: CardTitleProps;
  editorRect: Pick<DOMRect, "left" | "top" | "width">;
  fetcher: FetcherWithComponents<T>;
  textAreaRef: React.RefObject<React.ComponentRef<typeof Textarea> | null>;
  closeFloatingEditor: () => void;
  updateTitle: () => void;
}) {
  return createPortal(
    <>
      <div className="bg-background/60 fixed inset-0 z-50" />
      <fetcher.Form
        className="fixed z-50 space-y-2"
        method="POST"
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
              closeFloatingEditor();
            }
            if (evt.key === "Enter") {
              evt.preventDefault();
              updateTitle();
            }
          }}
          onBlur={closeFloatingEditor}
        />
        <Button type="submit">Save</Button>
      </fetcher.Form>
    </>,
    document.body,
  );
}

export function DialogEditCardTitle<T>({
  dialogTitleEdit,
  fetcher,
  inputRef,
  title,
  onTitleButtonClick,
  updateTitle,
}: {
  dialogTitleEdit: boolean;
  fetcher: FetcherWithComponents<T>;
  inputRef: React.RefObject<React.ComponentRef<typeof Input> | null>;
  title: string;
  onTitleButtonClick: () => void;
  updateTitle: () => void;
}) {
  return !dialogTitleEdit ? (
    <button
      className="text-2xl font-medium"
      onClick={() => {
        flushSync(onTitleButtonClick);
        inputRef.current?.focus();
      }}>
      {title}
    </button>
  ) : (
    <fetcher.Form
      method="POST"
      onSubmit={(evt) => {
        evt.preventDefault();
        updateTitle();
      }}>
      <Input
        ref={inputRef}
        className="text-2xl!"
        defaultValue={title}
        onKeyDown={(evt) => {
          if (evt.key === "Escape") {
            evt.preventDefault();
            updateTitle();
          }
        }}
        onBlur={updateTitle}
      />
    </fetcher.Form>
  );
}
