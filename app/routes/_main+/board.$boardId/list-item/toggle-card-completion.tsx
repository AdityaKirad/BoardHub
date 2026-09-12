import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { ACTIONS } from "../action";
import { CircleCheckIcon, CircleIcon } from "lucide-react";
import type { Card } from "../hooks";

export function ToggleCardCompletion({
  card,
  isPreview,
}: {
  card: Pick<Card, "id" | "completed">;
  isPreview: boolean;
}) {
  const fetcher = useFetcher();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [pending, pendingSet] = useState<boolean | null>(null);
  const [prevFetcherState, prevFetcherStateSet] = useState(fetcher.state);

  const Comp = isPreview ? "span" : "button";
  const optimisticCompleted = pending ?? card.completed;

  if (prevFetcherState !== fetcher.state) {
    prevFetcherStateSet(fetcher.state);
    if (fetcher.state === "idle" && pending !== null) {
      pendingSet(null);
    }
  }

  function handleClick() {
    const next = !optimisticCompleted;
    pendingSet(next);

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (next === card.completed) {
        pendingSet(null);
        return;
      }

      const formData = new FormData();

      formData.append("action", ACTIONS.TOGGLE_CARD_COMPLETION);
      formData.append("cardId", card.id);
      formData.append("completed", String(next));

      void fetcher.submit(formData, { method: "POST" });
    }, 400);
  }

  useEffect(() => () => clearTimeout(timeoutRef.current), []);
  return (
    <Comp
      className={
        !isPreview
          ? "opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 focus-visible:opacity-100"
          : ""
      }
      {...(!isPreview && {
        title: optimisticCompleted ? "Mark as incomplete" : "Mark as complete",
        onClick: handleClick,
      })}>
      {optimisticCompleted ? (
        <CircleCheckIcon width={16} height={16} />
      ) : (
        <CircleIcon width={16} height={16} />
      )}
    </Comp>
  );
}
