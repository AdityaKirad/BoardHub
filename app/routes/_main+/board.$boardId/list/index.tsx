import type {
  CardSelectType,
  ListSelectType,
} from "~/.server/db/schema/workspace";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { PlusIcon } from "lucide-react";
import { Fragment } from "react";
import { ListItem } from "../list-item";
import { CreateCard } from "../list-item/create-card";
import { CreateCardButton } from "./create-card-button";
import { ListTitle } from "./list-title";
import { useList } from "./use-list";

export function List({
  list,
}: {
  list: Pick<ListSelectType, "id" | "title"> & {
    cards: Omit<CardSelectType, "description" | "createdAt" | "updatedAt">[];
  };
}) {
  const cards = list.cards;
  const {
    closestEdge,
    createIndex,
    createPosition,
    isDragging,
    isDropTarget,
    listRef,
    placeholderHeight,
    closeCreateCard,
    handleNewCard,
    openCreateCard,
    openCreateCardAtEnd,
  } = useList({ listId: list.id, cards });

  if (isDragging && placeholderHeight) {
    return <ListPreview placeholderHeight={placeholderHeight} />;
  }

  return (
    <>
      {closestEdge === "left" && placeholderHeight && (
        <li className="basis-64" style={{ height: placeholderHeight }} />
      )}
      <li
        className={cn(
          "bg-card flex max-h-[calc(100%-3rem)] min-w-0 shrink-0 basis-64 flex-col overflow-hidden rounded-lg",
          { "outline-2 outline-offset-2 outline-white": isDropTarget },
        )}
        ref={listRef}>
        <ListTitle list={list} totalCards={cards.length} />

        <ul
          className={cn("relative min-h-0 flex-1 overflow-y-auto", {
            "p-2": cards.length || createIndex !== null,
          })}>
          {createIndex === 0 && createPosition && (
            <CreateCard
              listId={list.id}
              position={createPosition}
              onNewCard={handleNewCard}
              onCancel={closeCreateCard}
            />
          )}
          {Boolean(cards.length) && (
            <>
              {createIndex !== 0 && !isDragging && (
                <CreateCardButton onClick={() => openCreateCard(0)} />
              )}

              {cards.map((card, index) => (
                <Fragment key={card.id}>
                  <ListItem card={card} listId={list.id} index={index} />
                  {createIndex === index + 1 && createPosition ? (
                    <CreateCard
                      listId={list.id}
                      position={createPosition}
                      onNewCard={handleNewCard}
                      onCancel={closeCreateCard}
                    />
                  ) : index < cards.length - 1 ? (
                    <CreateCardButton
                      onClick={() => openCreateCard(index + 1)}
                    />
                  ) : null}
                </Fragment>
              ))}
            </>
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
      {closestEdge === "right" && placeholderHeight && (
        <li className="basis-64" style={{ height: placeholderHeight }} />
      )}
    </>
  );
}

export function ListPreview({
  placeholderHeight,
}: {
  placeholderHeight: number;
}) {
  return (
    <li
      className="bg-card/50 shrink-0 basis-64 rounded-lg"
      style={{ height: placeholderHeight }}
    />
  );
}
