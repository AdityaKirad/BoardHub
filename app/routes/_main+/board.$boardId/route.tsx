import { db } from "~/.server/db";
import { requireUser } from "~/.server/session";
import { List } from "~/routes/_main+/board.$boardId/list";
import { useRef } from "react";
import { redirect } from "react-router";
import type { Route } from "./+types/route";
import { BoardTitle } from "./board-title";
import { CreateList } from "./create-list";
import { useBoardDnd, useOptimisticLists } from "./hooks";

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
            columns: { description: false, createdAt: false, updatedAt: false },
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

export default function Page({ loaderData: { board } }: Route.ComponentProps) {
  const scrollAreaRef = useRef<React.ComponentRef<"ul">>(null);
  const lists = useOptimisticLists(board.lists);

  useBoardDnd(lists, scrollAreaRef);

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
          {lists.map((list, index) => (
            <List
              key={list.id}
              list={list}
              nextListPosition={lists[index + 1]?.position}
            />
          ))}
          <CreateList
            hasLists={lists.length > 0}
            lastListPosition={lists.at(-1)?.position}
            onNewList={() =>
              scrollAreaRef.current &&
              (scrollAreaRef.current.scrollLeft =
                scrollAreaRef.current.scrollWidth)
            }
          />
        </ul>
      </div>
    </div>
  );
}
