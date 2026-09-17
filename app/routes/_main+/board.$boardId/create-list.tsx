import { PlusIcon, XIcon } from "lucide-react";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { useOutsideClick } from "~/hooks/use-outside-click";
import { ACTIONS } from "./action";
import { Form, useSubmit } from "react-router";
import { createId } from "@paralleldrive/cuid2";
import { generateKeyBetween } from "fractional-indexing";

export function CreateList({
  hasLists,
  lastListPosition,
  onNewList,
}: {
  hasLists: boolean;
  lastListPosition: string | undefined;
  onNewList: () => void;
}) {
  const submit = useSubmit();
  const formRef = useRef<React.ComponentRef<typeof Form>>(null);
  const textAreaRef = useRef<React.ComponentRef<typeof Textarea>>(null);
  const [create, createSet] = useState(false);

  function createList() {
    if (!textAreaRef.current?.value) {
      return;
    }

    const formData = new FormData();

    formData.append("action", ACTIONS.CREATE_LIST);
    formData.append("id", createId());
    formData.append("title", textAreaRef.current.value);
    formData.append("position", generateKeyBetween(lastListPosition, null));

    void submit(formData, { method: "POST", navigate: false, flushSync: true });

    onNewList();

    textAreaRef.current.value = "";
    textAreaRef.current.focus();
  }

  useOutsideClick(formRef, () => createSet(false));

  return create ? (
    <Form
      className="bg-card min-w-0 shrink-0 basis-64 space-y-2 rounded-lg p-2"
      ref={formRef}
      onSubmit={(evt) => {
        evt.preventDefault();
        createList();
      }}>
      <Textarea
        className="min-h-0 resize-none"
        placeholder="Enter list name..."
        name="title"
        ref={textAreaRef}
        onKeyDown={(evt) => {
          if (evt.key === "Enter") {
            evt.preventDefault();
            createList();
          } else if (evt.key === "Escape") {
            createSet(false);
          }
        }}
      />
      <div className="flex gap-2">
        <Button type="submit">Add list</Button>
        <Button variant="ghost" size="icon" onClick={() => createSet(false)}>
          <XIcon />
        </Button>
      </div>
    </Form>
  ) : (
    <Button
      className="min-w-0 shrink-0 basis-64 rounded-lg bg-white/60 hover:bg-white/70 focus-visible:bg-white/70 focus-visible:outline-white/70"
      size="lg"
      onClick={() => {
        flushSync(() => createSet(true));
        textAreaRef.current?.focus();
      }}>
      <PlusIcon /> {hasLists ? "Add another list" : "Add list"}
    </Button>
  );
}
