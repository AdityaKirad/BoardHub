import { useEffect } from "react";

export function useOutsideClick<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  callback: () => void,
) {
  useEffect(() => {
    const controller = new AbortController();

    document.addEventListener(
      "click",
      (evt) => {
        if (ref?.current && !ref.current.contains(evt.target as Node)) {
          callback();
        }
      },
      { signal: controller.signal },
    );

    return () => controller.abort();
  });
}
