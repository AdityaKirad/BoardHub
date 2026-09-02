import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { ACTIONS } from "../action";
import { CircleCheckIcon, CircleIcon } from "lucide-react";

export function ToggleCardCompletion({
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
