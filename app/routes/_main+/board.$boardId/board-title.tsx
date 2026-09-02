import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useOutsideClick } from "~/hooks/use-outside-click";
import { ACTIONS } from "./action";

export function BoardTitle({ title }: { title: string }) {
  const fetcher = useFetcher();
  const ref = useRef<React.ComponentRef<typeof Input>>(null);
  const [edit, editSet] = useState(false);

  if (fetcher.formData?.has("title")) {
    // eslint-disable-next-line react-hooks/immutability, @typescript-eslint/no-base-to-string
    title = String(fetcher.formData.get("title"));
  }

  function updateTitle() {
    const currentValue = ref.current?.value;

    if (currentValue && currentValue !== title) {
      const formData = new FormData();

      formData.append("action", ACTIONS.UPDATE_BOARD_TITLE);
      formData.append("title", currentValue);

      void fetcher.submit(formData, {
        method: "POST",
        flushSync: true,
      });
    }

    editSet(false);
  }

  useOutsideClick(ref, updateTitle);

  useEffect(() => {
    document.title = `${title} | BoardHub`;
  }, [title]);

  return edit ? (
    <fetcher.Form
      className="w-fit"
      method="POST"
      onSubmit={(evt) => {
        evt.preventDefault();
        updateTitle();
      }}>
      <Input
        ref={ref}
        className="field-sizing-content"
        name="title"
        defaultValue={title}
        onKeyDown={(evt) => {
          if (evt.key === "Escape") {
            updateTitle();
          }
        }}
        onBlur={updateTitle}
      />
    </fetcher.Form>
  ) : (
    <Button
      variant="ghost"
      onClick={() => {
        flushSync(() => editSet(true));
        ref.current?.focus();
      }}>
      {title}
    </Button>
  );
}
