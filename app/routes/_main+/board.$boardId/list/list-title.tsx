import { useRef, useState } from "react";
import { useFetcher } from "react-router";
import { useListContext } from "./list-context";
import { ACTIONS } from "../action";
import { useOutsideClick } from "~/hooks/use-outside-click";
import { Textarea } from "~/components/ui/textarea";
import { flushSync } from "react-dom";

export function ListTitle() {
  const fetcher = useFetcher();
  const ref = useRef<React.ComponentRef<typeof Textarea>>(null);
  const { list } = useListContext();
  const [edit, editSet] = useState(false);

  let title = list.title;

  if (fetcher.formData?.has("title")) {
    title = fetcher.formData?.get("title") as string;
  }

  function updateTitle() {
    const currentValue = ref.current?.value;

    if (currentValue && currentValue !== title) {
      const formData = new FormData();

      formData.append("action", ACTIONS.UPDATE_LIST_TITLE);
      formData.append("id", list.id);
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
    <h2 className="flex-1">
      {edit ? (
        <fetcher.Form className="flex-1" method="POST" onSubmit={updateTitle}>
          <Textarea
            className="resize-none"
            name="title"
            ref={ref}
            defaultValue={title}
            onKeyDown={(evt) => {
              if (evt.key === "Escape" || evt.key === "Enter") {
                evt.preventDefault();
                updateTitle();
              }
            }}
            onBlur={updateTitle}
          />
        </fetcher.Form>
      ) : (
        <button
          className="min-h-8 w-full flex-1 cursor-pointer text-left"
          onClick={() => {
            flushSync(() => editSet(true));
            ref.current?.focus();
          }}>
          {title}
        </button>
      )}
    </h2>
  );
}
