import { CircleCheckIcon, CircleIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { ACTIONS } from "../action";
import type { Card } from "../types";

export function ToggleCardCompletion({
  card,
  isPreview,
}: {
  card: Pick<Card, "id" | "completed">;
  isPreview: boolean;
}) {
  const fetcher = useFetcher();
  const { set: setCompleted, value: completed } = useDebouncedToggle({
    isIdle: fetcher.state === "idle",
    value: card.completed,
    onCommit(next) {
      const formData = new FormData();

      formData.append("action", ACTIONS.TOGGLE_CARD_COMPLETION);
      formData.append("id", card.id);
      formData.append("completed", String(next));

      void fetcher.submit(formData, { method: "POST" });
    },
  });

  const Comp = isPreview ? "span" : "button";

  return (
    <Comp
      className={
        !isPreview
          ? "opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 focus-visible:opacity-100"
          : ""
      }
      {...(!isPreview && {
        type: "button" as const,
        title: completed ? "Mark as incomplete" : "Mark as complete",
        "aria-pressed": completed,
        "aria-label": completed ? "Mark as incomplete" : "Mark as complete",
        onClick: () => setCompleted(),
      })}>
      {completed ? (
        <CircleCheckIcon width={16} height={16} />
      ) : (
        <CircleIcon width={16} height={16} />
      )}
    </Comp>
  );
}

function useDebouncedToggle({
  delay = 400,
  isIdle,
  value,
  onCommit,
}: {
  delay?: number;
  isIdle: boolean;
  value: boolean;
  onCommit: (next: boolean) => void;
}) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const valueRef = useRef(value);
  const [didSubmit, didSubmitSet] = useState(false);
  const [pending, pendingSet] = useState<boolean | null>(null);

  const optimisticValue =
    isIdle && didSubmit && pending !== null && pending !== value
      ? value
      : (pending ?? value);

  function set() {
    const next = !optimisticValue;
    pendingSet(next);
    didSubmitSet(false);

    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      if (next === valueRef.current) {
        pendingSet(null);
        return;
      }
      didSubmitSet(true);
      onCommit(next);
    }, delay);
  }

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return { set, value: optimisticValue };
}
