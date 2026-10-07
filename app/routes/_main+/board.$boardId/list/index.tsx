import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { PlusIcon } from "lucide-react";
import { Fragment } from "react";
import { createPortal } from "react-dom";
import { CardPlaceholder, ListItem } from "../list-item";
import { CreateCard } from "../list-item/create-card";
import type { List } from "../types";
import { CreateCardButton } from "./create-card-button";
import { useCreateCard, useListDnd, type ListState } from "./hooks";
import { ListContextProvider } from "./list-context";
import { ListHeader } from "./list-header";

function ListDisplay({
  cardContainerRef,
  headerRef,
  listRef,
  index,
  list,
  onOptimisticColorChange,
  nextListPosition,
  state,
}: {
  list: List;
  onOptimisticColorChange: (color: string | null) => void;
  state: ListState;
  index?: number;
  cardContainerRef?: React.RefObject<React.ComponentRef<"ul"> | null>;
  headerRef?: React.RefObject<React.ComponentRef<"div"> | null>;
  listRef?: React.RefObject<React.ComponentRef<"li"> | null>;
  nextListPosition?: string;
}) {
  const cards = list.cards.filter((card) => !card.archived);

  const {
    createIndex,
    createPosition,
    closeCreateCard,
    handleNewCard,
    openCreateCard,
    openCreateCardAtEnd,
  } = useCreateCard(cards, cardContainerRef);

  return (
    <>
      {state.type === "is-column-over" && state.closestEdge === "left" && (
        <ListPlaceholder rect={state.rect} />
      )}
      <ListContextProvider
        value={{
          cards,
          list,
          nextListPosition,
          openCreateCard,
          onOptimisticColorChange,
        }}>
        <li
          className="shrink-0 px-1 first:pl-0"
          ref={listRef}
          style={{
            order: list.pinned ? -1 : index,
          }}>
          <div
            className={cn(
              "relative flex max-h-full flex-col overflow-hidden rounded-lg",
              list.collapsed ? "w-fit" : "w-64",
              {
                "outline-2 outline-offset-2 outline-white":
                  state.type === "is-card-over",
              },
            )}
            style={{
              backgroundColor: list.color || "var(--list-color-black)",
            }}>
            <ListHeader ref={headerRef} totalCards={cards.length} />
            <ul
              className={cn(
                "relative min-h-0 flex-1 overflow-y-auto scroll-smooth",
                {
                  hidden: list.collapsed,
                  "p-2": cards.length || createIndex !== null,
                  "space-y-2": state.type === "is-card-over",
                },
              )}
              ref={cardContainerRef}>
              {createIndex === 0 && createPosition && (
                <CreateCard
                  position={createPosition}
                  onNewCard={handleNewCard}
                  onCancel={closeCreateCard}
                />
              )}
              {createIndex !== 0 &&
                cards.length > 0 &&
                state.type !== "is-card-over" && (
                  <CreateCardButton onClick={() => openCreateCard(0)} />
                )}
              {cards.map((card, index) => (
                <Fragment key={card.id}>
                  <ListItem {...card} />
                  {createIndex === index + 1 && createPosition ? (
                    <CreateCard
                      position={createPosition}
                      onNewCard={handleNewCard}
                      onCancel={closeCreateCard}
                    />
                  ) : state.type !== "is-card-over" &&
                    index < cards.length - 1 ? (
                    <CreateCardButton
                      onClick={() => openCreateCard(index + 1)}
                    />
                  ) : null}
                </Fragment>
              ))}
              {state.type === "is-card-over" && !state.isOverChildCard && (
                <CardPlaceholder rect={state.rect} />
              )}
            </ul>

            {createIndex === null && (
              <div className={cn("p-2", { hidden: list.collapsed })}>
                <Button
                  className="w-full justify-start rounded-lg"
                  variant="ghost"
                  onClick={openCreateCardAtEnd}>
                  <PlusIcon /> Create card
                </Button>
              </div>
            )}
          </div>
        </li>
      </ListContextProvider>
      {state.type === "is-column-over" && state.closestEdge === "right" && (
        <ListPlaceholder rect={state.rect} />
      )}
    </>
  );
}

export function List({
  index,
  list,
  onOptimisticColorChange,
  nextListPosition,
}: {
  index: number;
  list: List;
  onOptimisticColorChange: (color: string | null) => void;
  nextListPosition: string | undefined;
}) {
  const { cardContainerRef, listRef, headerRef, state } = useListDnd({
    listId: list.id,
    pinned: list.pinned,
  });
  return (
    <>
      <ListDisplay
        cardContainerRef={cardContainerRef}
        headerRef={headerRef}
        listRef={listRef}
        index={index}
        list={list}
        onOptimisticColorChange={onOptimisticColorChange}
        nextListPosition={nextListPosition}
        state={state}
      />
      {state.type === "preview" &&
        createPortal(
          <ListDisplay
            list={list}
            state={state}
            onOptimisticColorChange={onOptimisticColorChange}
          />,
          state.container,
        )}
    </>
  );
}

export function ListPlaceholder({ rect }: { rect: DOMRect }) {
  return (
    <li
      className="bg-card/50 shrink-0 rounded-lg"
      style={{ height: rect.height, width: rect.width }}
    />
  );
}
