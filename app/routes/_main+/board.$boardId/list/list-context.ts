import { createContext, useContext } from "react";
import type { List } from "../types";

export const ListContext = createContext<{
  list: Omit<List, "cards">;
  cards: List["cards"];
  nextListPosition: string | undefined;
  openCreateCard: (index: number) => void;
  onOptimisticColorChange: (color: string | null) => void;
} | null>(null);

export function useListContext() {
  const context = useContext(ListContext);
  if (!context) {
    throw new Error("useListContext must be used within a list");
  }
  return context;
}

export const ListContextProvider = ListContext.Provider;
