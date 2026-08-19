import { db } from "~/.server/db";
import { requireUser } from "~/.server/session";
import List from "~/routes/_main+/board.$boardId/list";
import { useRef } from "react";
import { redirect, useFetchers } from "react-router";
import type { Route } from "./+types/route";
import { ACTIONS } from "./action";
import { BoardTitle } from "./board-title";
import { CreateList } from "./create-list";

export { action } from "./board-action.server";

export const meta: Route.MetaFunction = ({ loaderData: { board } }) => [
  { title: `${board?.title} | BoardHub` },
];

export async function loader({ params, request }: Route.LoaderArgs) {
  const { username } = await requireUser(request);

  const board = await db.query.board.findFirst({
    columns: { id: false, userId: false },
    with: {
      lists: {
        columns: { boardId: false, createdAt: false, updatedAt: false },
        orderBy: (list, { asc }) => asc(list.position),
        with: {
          cards: {
            columns: { createdAt: false, updatedAt: false },
            orderBy: (card, { asc }) => asc(card.position),
          },
        },
      },
    },
    where: (board, { eq }) => eq(board.id, params.boardId),
  });

  if (!board) {
    return redirect(`/${username}/boards`);
  }

  return { board };
}

type ListWithCards =
  Route.ComponentProps["loaderData"]["board"]["lists"][number];

export default function Page({ loaderData: { board } }: Route.ComponentProps) {
  const scrollAreaRef = useRef<React.ComponentRef<"ul">>(null);

  const pending = usePendingChanges();

  const lists = buildLists(board.lists, pending);

  return (
    <div className="relative h-[calc(100vh-5.05rem)] supports-[height:100dvh]:h-[calc(100dvh-5.05rem)]">
      <div
        className="absolute inset-0 flex flex-col rounded-xl border"
        style={{ background: board.background }}>
        <div className="bg-background/50 p-4 font-bold">
          <BoardTitle title={board.title} />
        </div>
        <ul
          className="flex w-full flex-1 items-start gap-4 overflow-x-auto overflow-y-hidden p-2"
          ref={scrollAreaRef}>
          {lists.map((list) => (
            <List key={list.id} list={list} />
          ))}
          <CreateList
            totalLists={[...lists.values()].length}
            onNewList={() => {
              if (scrollAreaRef.current) {
                scrollAreaRef.current.scrollLeft =
                  scrollAreaRef.current.scrollWidth;
              }
            }}
          />
        </ul>
      </div>
    </div>
  );
}

function buildLists(
  realLists: ListWithCards[],
  pending: ReturnType<typeof usePendingChanges>,
) {
  const { pendingListIds, pendingLists, pendingCardIds, pendingCardsByList } =
    pending;

  const merged: ListWithCards[] = [];

  for (const list of realLists) {
    if (pendingListIds.has(list.id)) {
      continue;
    }

    const extraCards = pendingCardsByList.get(list.id);

    const cards = extraCards
      ? list.cards
          .filter((card) => !pendingCardIds.has(card.id))
          .concat(extraCards)
      : list.cards;

    merged.push(cards === list.cards ? list : { ...list, cards });
  }

  for (const list of pendingLists) {
    merged.push({
      ...list,
      cards: pendingCardsByList.get(list.id) ?? [],
    });
  }

  return merged;
}

function usePendingChanges() {
  const fetchers = useFetchers();

  const pendingLists: ListWithCards[] = [];
  const pendingCardsByList = new Map<string, ListWithCards["cards"]>();
  const pendingCardIds = new Set<string>();
  const pendingListIds = new Set<string>();

  for (const fetcher of fetchers) {
    const formData = fetcher.formData;

    if (!formData) {
      continue;
    }

    const action = formData.get("action");

    if (action === ACTIONS.CREATE_LIST) {
      const id = formData.get("id") as string;
      pendingListIds.add(id);
      pendingLists.push({
        id,
        title: formData.get("title") as string,
        archived: false,
        color: null,
        position: formData.get("position") as string,
        cards: [],
      });
      continue;
    }

    if (action === ACTIONS.CREATE_CARD) {
      const id = formData.get("id") as string;
      const listId = formData.get("listId") as string;

      pendingCardIds.add(id);

      const card = {
        id,
        listId,
        title: formData.get("title") as string,
        description: null,
        position: formData.get("position") as string,
        completed: formData.get("completed") === "true",
      };

      const list = pendingCardsByList.get(listId);

      if (list) {
        list.push(card);
      } else {
        pendingCardsByList.set(listId, [card]);
      }
    }
  }

  return { pendingCardIds, pendingCardsByList, pendingListIds, pendingLists };
}
