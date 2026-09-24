import { createContext, useContext } from "react";
import type { Route } from "./+types/route";

const BoardContext = createContext<{
  boards: Route.ComponentProps["loaderData"]["boards"];
  lists: Route.ComponentProps["loaderData"]["board"]["lists"];
} | null>(null);

export function useBoardContext() {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error("useBoardContext must be used within a board");
  }
  return context;
}

export const BoardContextProvider = BoardContext.Provider;
