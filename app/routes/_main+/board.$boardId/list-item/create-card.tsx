import { createId } from "@paralleldrive/cuid2";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { useOutsideClick } from "~/hooks/use-outside-click";
import { XIcon } from "lucide-react";
import { useRef } from "react";
import { Form, useSubmit } from "react-router";
import { ACTIONS } from "../action";

export function CreateCard({
  listId,
  position,
  onNewCard,
  onCancel,
}: {
  listId: string;
  position: string;
  onNewCard: () => void;
  onCancel: () => void;
}) {
  const submit = useSubmit();
  const formRef = useRef<React.ComponentRef<typeof Form>>(null);
  const textAreaRef = useRef<React.ComponentRef<typeof Textarea>>(null);

  function createCard() {
    if (!textAreaRef.current?.value) {
      return;
    }

    const formData = new FormData();

    formData.append("action", ACTIONS.CREATE_CARD);
    formData.append("cardId", createId());
    formData.append("listId", listId);
    formData.append("title", textAreaRef.current.value);
    formData.append("position", position);

    void submit(formData, {
      method: "POST",
      navigate: false,
      flushSync: true,
    });

    onNewCard();

    textAreaRef.current.value = "";
    textAreaRef.current.focus();
  }

  useOutsideClick(formRef, onCancel);

  return (
    <li>
      <Form
        className="my-2 space-y-2"
        method="POST"
        ref={formRef}
        onSubmit={(evt) => {
          evt.preventDefault();
          createCard();
        }}>
        <Textarea
          className="min-h-10 resize-none focus-visible:border-none focus-visible:ring-0"
          placeholder="Enter a title or paste a link"
          name="title"
          ref={textAreaRef}
          onKeyDown={(evt) => {
            if (evt.key === "Enter") {
              evt.preventDefault();
              createCard();
            } else if (evt.key === "Escape") {
              onCancel();
            }
          }}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
        />
        <div className="flex gap-2">
          <Button type="submit">Add card</Button>
          <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
            <XIcon />
          </Button>
        </div>
      </Form>
    </li>
  );
}
