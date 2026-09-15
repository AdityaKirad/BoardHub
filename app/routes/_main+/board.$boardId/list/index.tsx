import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { PlusIcon } from "lucide-react";
import { Fragment } from "react";
import { CardPlaceholder, ListItem } from "../list-item";
import { CreateCard } from "../list-item/create-card";
import { CreateCardButton } from "./create-card-button";
import { ListHeader } from "./list-header";
import { useCreateCard, useListDnd, type ListState } from "./hooks";
import { createPortal } from "react-dom";
import type { List } from "../hooks";

function ListDisplay({
  cardContainerRef,
  headerRef,
  listRef,
  list,
  state,
}: {
  list: List;
  state: ListState;
  cardContainerRef?: React.RefObject<React.ComponentRef<"ul"> | null>;
  headerRef?: React.RefObject<React.ComponentRef<"div"> | null>;
  listRef?: React.RefObject<React.ComponentRef<"li"> | null>;
}) {
  const {
    createIndex,
    createPosition,
    closeCreateCard,
    handleNewCard,
    openCreateCard,
    openCreateCardAtEnd,
  } = useCreateCard(list.cards, cardContainerRef);
  const cards = list.cards;
  return (
    <>
      {state.type === "is-column-over" && state.closestEdge === "left" && (
        <ListPlaceholder rect={state.rect} />
      )}
      <li
        className={cn(
          "bg-card relative flex max-h-[calc(100%-3rem)] min-w-0 shrink-0 basis-64 flex-col overflow-hidden rounded-lg",
          {
            "outline-2 outline-offset-2 outline-white":
              state.type === "is-card-over",
          },
        )}
        ref={listRef}>
        <ListHeader ref={headerRef} list={list} totalCards={cards.length} />
        <ul
          className={cn("relative min-h-0 flex-1 overflow-y-auto", {
            "p-2": cards.length || createIndex !== null,
            "space-y-2": state.type === "is-card-over",
          })}
          ref={cardContainerRef}>
          {createIndex === 0 && createPosition && (
            <CreateCard
              listId={list.id}
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
              <ListItem card={card} listTitle={list.title} />
              {createIndex === index + 1 && createPosition ? (
                <CreateCard
                  listId={list.id}
                  position={createPosition}
                  onNewCard={handleNewCard}
                  onCancel={closeCreateCard}
                />
              ) : state.type !== "is-card-over" && index < cards.length - 1 ? (
                <CreateCardButton onClick={() => openCreateCard(index + 1)} />
              ) : null}
            </Fragment>
          ))}
          {state.type === "is-card-over" && !state.isOverChildCard && (
            <CardPlaceholder rect={state.rect} />
          )}
        </ul>

        {createIndex === null && (
          <div className="bg-card p-2">
            <Button
              className="w-full justify-start rounded-lg"
              variant="ghost"
              onClick={openCreateCardAtEnd}>
              <PlusIcon /> Create card
            </Button>
          </div>
        )}
      </li>
      {state.type === "is-column-over" && state.closestEdge === "right" && (
        <ListPlaceholder rect={state.rect} />
      )}
    </>
  );
}

export function List({ list }: { list: List }) {
  const { cardContainerRef, listRef, headerRef, state } = useListDnd(list.id);
  return (
    <>
      <ListDisplay
        cardContainerRef={cardContainerRef}
        headerRef={headerRef}
        listRef={listRef}
        list={list}
        state={state}
      />
      {state.type === "preview" &&
        createPortal(
          <ListDisplay list={list} state={state} />,
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
