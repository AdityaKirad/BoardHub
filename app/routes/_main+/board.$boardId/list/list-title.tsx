import { useRef, useState } from "react";
import { Form, useFetcher } from "react-router";
import type { ListSelectType } from "~/.server/db/schema/workspace";
import { Textarea } from "~/components/ui/textarea";
import { ACTIONS } from "../action";
import { useOutsideClick } from "~/hooks/use-outside-click";
import { flushSync } from "react-dom";

export function ListTitle({
  list,
  totalCards,
}: {
  list: Pick<ListSelectType, "id" | "title">;
  totalCards: number;
}) {
  const fetcher = useFetcher();
  const ref = useRef<React.ComponentRef<typeof Textarea>>(null);
  const [edit, editSet] = useState(false);

  const optimisticTitle =
    (fetcher.formData?.get("title") as string) ?? list.title;

  function updateTitle() {
    const currentValue = ref.current?.value;

    if (currentValue && currentValue !== list.title) {
      const formData = new FormData();

      formData.append("action", ACTIONS.UPDATE_LIST_TITLE);
      formData.append("listId", list.id);
      formData.append("title", currentValue);

      void fetcher.submit(formData, {
        method: "POST",
        flushSync: true,
      });
    }

    editSet(false);
  }

  useOutsideClick(ref, updateTitle);
  return (
    <h2 className="bg-card flex items-center gap-1 px-2 pt-2">
      {edit ? (
        <Form className="flex-1" method="POST" onSubmit={updateTitle}>
          <Textarea
            className="resize-none"
            name="title"
            ref={ref}
            defaultValue={optimisticTitle}
            onKeyDown={(evt) => {
              if (evt.key === "Escape" || evt.key === "Enter") {
                evt.preventDefault();
                updateTitle();
              }
            }}
            onBlur={updateTitle}
          />
        </Form>
      ) : (
        <button
          className="min-h-8 flex-1 text-left"
          onClick={() => {
            flushSync(() => editSet(true));
            ref.current?.focus();
          }}>
          {optimisticTitle}
        </button>
      )}
      {totalCards}
    </h2>
  );
}
