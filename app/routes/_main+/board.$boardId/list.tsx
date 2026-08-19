import type {
  CardSelectType,
  ListSelectType,
} from "~/.server/db/schema/workspace";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { useOutsideClick } from "~/hooks/use-outside-click";
import { generateKeyBetween } from "fractional-indexing";
import { PlusIcon } from "lucide-react";
import { Fragment, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useFetcher } from "react-router";
import { ACTIONS } from "./action";
import { CreateCard, type CreatedCard } from "./create-card";
import { ListItem } from "./list-item";

type ListCard = Omit<CardSelectType, "createdAt" | "updatedAt">;

export default function List({
  list,
}: {
  list: Pick<ListSelectType, "id" | "title"> & {
    cards: ListCard[];
  };
}) {
  const listRef = useRef<React.ComponentRef<"li">>(null);

  const [localCards, localCardsSet] = useState<CreatedCard[]>([]);
  const listCardIds = new Set(list.cards.map((card) => card.id));
  const cards = [
    ...list.cards,
    ...localCards.filter((card) => !listCardIds.has(card.id)),
  ].sort((a, b) => a.position.localeCompare(b.position));
  const [createIndex, createIndexSet] = useState<number | null>(null);

  function scrollToNewCardForm() {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }

  function openCreateCard(index: number) {
    flushSync(() => createIndexSet(index));
  }

  function handleNewCard(card: CreatedCard) {
    const nextCards = [
      ...cards.filter((item) => item.id !== card.id),
      card,
    ].sort((a, b) => a.position.localeCompare(b.position));
    const nextCreateIndex =
      nextCards.findIndex((item) => item.id === card.id) + 1;

    localCardsSet((current) =>
      current.some((item) => item.id === card.id)
        ? current
        : [...current, card],
    );
    createIndexSet(nextCreateIndex);
    scrollToNewCardForm();
  }

  const createPosition =
    createIndex === null
      ? null
      : generateKeyBetween(
          cards[createIndex - 1]?.position ?? null,
          cards[createIndex]?.position ?? null,
        );

  return (
    <li
      className="bg-card flex max-h-[calc(100%-3rem)] min-w-0 shrink-0 basis-64 flex-col overflow-hidden rounded-lg"
      ref={listRef}>
      <ListTitle list={list} totalCards={cards.length} />

      <ul className="min-h-0 flex-1 overflow-y-auto p-2">
        {createIndex === 0 && createPosition && (
          <CreateCard
            listId={list.id}
            position={createPosition}
            onNewCard={handleNewCard}
            onCancel={() => createIndexSet(null)}
          />
        )}

        {createIndex !== 0 && (
          <CreateCardButton
            className="shrink-0"
            onClick={() => openCreateCard(0)}
          />
        )}

        {cards.map((card, index) => (
          <Fragment key={card.id}>
            <ListItem card={card} />
            {createIndex === index + 1 && createPosition ? (
              <CreateCard
                listId={list.id}
                position={createPosition}
                onNewCard={handleNewCard}
                onCancel={() => createIndexSet(null)}
              />
            ) : index < cards.length - 1 ? (
              <CreateCardButton onClick={() => openCreateCard(index + 1)} />
            ) : null}
          </Fragment>
        ))}
      </ul>

      {createIndex === null && (
        <div className="bg-card p-2">
          <Button
            className="w-full justify-start rounded-lg"
            variant="ghost"
            onClick={() => {
              openCreateCard(cards.length);
              scrollToNewCardForm();
            }}>
            <PlusIcon /> Create card
          </Button>
        </div>
      )}
    </li>
  );
}

function CreateCardButton({
  className,
  onClick,
}: {
  className?: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`group relative block h-2 w-full ${className ?? ""}`}
      type="button"
      onClick={onClick}>
      <hr className="group-hover:border-border -inset-x-2 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-transparent transition-colors" />
      <div className="bg-muted after:bg-muted-foreground before:bg-muted-foreground absolute top-1/2 left-1/2 h-4 w-6 -translate-x-1/2 -translate-y-1/2 rounded opacity-0 transition-opacity group-hover:opacity-100 before:absolute before:top-1/2 before:left-1/2 before:h-2.5 before:w-[1.5px] before:-translate-x-1/2 before:-translate-y-1/2 after:absolute after:top-1/2 after:left-1/2 after:h-[1.5px] after:w-2.5 after:-translate-x-1/2 after:-translate-y-1/2" />
    </button>
  );
}

function ListTitle({
  list,
  totalCards,
}: {
  list: Pick<ListSelectType, "id" | "title">;
  totalCards: number;
}) {
  const fetcher = useFetcher();
  const ref = useRef<React.ComponentRef<typeof Textarea>>(null);
  const [edit, editSet] = useState(false);

  const optimisticTitle =
    (fetcher.formData?.get("title") as string) ?? list.title;

  function updateTitle() {
    const currentValue = ref.current?.value;

    if (currentValue && currentValue !== list.title) {
      const formData = new FormData();

      formData.append("action", ACTIONS.UPDATE_LIST_TITLE);
      formData.append("listId", list.id);
      formData.append("title", currentValue);

      void fetcher.submit(formData, {
        method: "POST",
        flushSync: true,
      });
    }

    editSet(false);
  }

  useOutsideClick(ref, updateTitle);
  return (
    <h2 className="bg-card flex items-center gap-1 px-2 pt-2">
      {edit ? (
        <fetcher.Form className="flex-1" method="POST" onSubmit={updateTitle}>
          <Textarea
            className="resize-none"
            name="title"
            ref={ref}
            defaultValue={optimisticTitle}
            onKeyDown={(evt) => {
              if (evt.key === "Escape" || evt.key === "Enter") {
                evt.preventDefault();
                updateTitle();
              }
            }}
            onBlur={updateTitle}
          />
        </fetcher.Form>
      ) : (
        <button
          className="min-h-8 flex-1 text-left"
          onClick={() => {
            flushSync(() => editSet(true));
            ref.current?.focus();
          }}>
          {optimisticTitle}
        </button>
      )}
      {totalCards}
    </h2>
  );
}
