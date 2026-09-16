import { createContext, useContext } from "react";
import type { List } from "../hooks";

export const ListContext = createContext<{
  list: Pick<List, "id" | "title" | "position">;
  nextListPosition: string | undefined;
  openCreateCard: (index: number) => void;
} | null>(null);

export function useListContext() {
  const context = useContext(ListContext);
  if (!context) {
    throw new Error("useListContext must be used within a list");
  }
  return context;
}

export const ListContextProvider = ListContext.Provider;
