import { useCallback, useEffect, useRef } from "react";
import { useFetcher } from "react-router";
import {
  DEFAULT_LIST_COLOR,
  LIST_COLOR_SUBMIT_DELAY,
} from "./list-color-options";
import { ACTIONS } from "../../../action";

export function useListColorPicker({
  listId,
  color,
  onOptimisticColorChange,
}: {
  listId: string;
  color: string;
  onOptimisticColorChange: (color: string | null) => void;
}) {
  const fetcher = useFetcher();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submitPendingRef = useRef<(() => void) | null>(null);
  const pendingColorRef = useRef<string | null>(null);
  const submittedColorRef = useRef<string | null>(null);
  const hasBeenSubmittingRef = useRef(false);

  const submitColor = useCallback(
    (nextColor: string) => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      submitPendingRef.current = null;
      pendingColorRef.current = nextColor;
      submittedColorRef.current = nextColor;
      onOptimisticColorChange(nextColor);

      const formData = new FormData();
      formData.append("action", ACTIONS.CHANGE_LIST_BACKGROUND);
      formData.append("id", listId);
      formData.append("color", nextColor);

      void fetcher.submit(formData, { method: "POST" });
    },
    [fetcher, listId, onOptimisticColorChange],
  );

  const scheduleColor = useCallback(
    (nextColor: string) => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
      pendingColorRef.current = nextColor;
      onOptimisticColorChange(nextColor);
      submitPendingRef.current = () => submitColor(nextColor);
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        submitPendingRef.current?.();
      }, LIST_COLOR_SUBMIT_DELAY);
    },
    [onOptimisticColorChange, submitColor],
  );

  useEffect(() => {
    if (fetcher.state !== "idle") {
      hasBeenSubmittingRef.current = true;
      return;
    }
    if (!hasBeenSubmittingRef.current) return;

    hasBeenSubmittingRef.current = false;
    if (
      timeoutRef.current === null &&
      pendingColorRef.current === submittedColorRef.current
    ) {
      onOptimisticColorChange(null);
      pendingColorRef.current = null;
    }
  }, [fetcher.state, onOptimisticColorChange]);

  useEffect(
    () => () => {
      if (timeoutRef.current !== null && pendingColorRef.current !== null) {
        clearTimeout(timeoutRef.current);
        submitPendingRef.current?.();
      }
    },
    [],
  );

  return {
    isDefaultSelected: (color || DEFAULT_LIST_COLOR) === DEFAULT_LIST_COLOR,
    selectedColor: color || DEFAULT_LIST_COLOR,
    removeColor: () => submitColor(""),
    scheduleColor,
    selectColor: submitColor,
  };
}
