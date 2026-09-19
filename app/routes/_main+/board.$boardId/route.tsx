import { db } from "~/.server/db";
import { requireUser } from "~/.server/session";
import { List } from "~/routes/_main+/board.$boardId/list";
import { useRef } from "react";
import { redirect } from "react-router";
import type { Route } from "./+types/route";
import { BoardTitle } from "./board-title";
import { CreateList } from "./create-list";
import { BoardContextProvider } from "./board-context";
import { useOptimisticLists } from "./use-optimistic-list";
import { useBoardDnd } from "./use-board-dnd";

export { action } from "./board-action.server";

export const meta: Route.MetaFunction = ({ loaderData: { board } }) => [
  { title: `${board?.title} | BoardHub` },
];

export async function loader({ params, request }: Route.LoaderArgs) {
  const { id, username } = await requireUser(request);

  const [boards, board] = await Promise.all([
    db.query.board
      .findMany({
        columns: { id: true, title: true },
        with: {
          lists: {
            columns: { id: true, position: true },
            orderBy: (list, { asc }) => asc(list.position),
          },
        },
        where: (board, { eq }) => eq(board.userId, id),
      })
      .execute(),
    db.query.board
      .findFirst({
        columns: { userId: false },
        with: {
          lists: {
            columns: { boardId: false, createdAt: false, updatedAt: false },
            orderBy: (list, { asc }) => asc(list.position),
            with: {
              cards: {
                columns: {
                  description: false,
                  createdAt: false,
                  updatedAt: false,
                },
                orderBy: (card, { asc }) => asc(card.position),
              },
            },
          },
        },
        where: (board, { eq }) => eq(board.id, params.boardId),
      })
      .execute(),
  ]);

  if (!board) {
    return redirect(`/${username}/boards`);
  }

  return { board, boards };
}

export default function Page({
  loaderData: { board, boards },
}: Route.ComponentProps) {
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
          className="flex w-full flex-1 items-start overflow-x-auto overflow-y-hidden p-2"
          ref={scrollAreaRef}>
          <BoardContextProvider value={{ boards, lists: board.lists }}>
            {lists.map((list, index) => (
              <li className="shrink-0 px-1" key={list.id}>
                <List
                  list={list}
                  nextListPosition={lists[index + 1]?.position}
                />
              </li>
            ))}
          </BoardContextProvider>
          <li className="shrink-0 px-1">
            <CreateList
              hasLists={lists.length > 0}
              lastListPosition={lists.at(-1)?.position}
              onNewList={() =>
                scrollAreaRef.current &&
                (scrollAreaRef.current.scrollLeft =
                  scrollAreaRef.current.scrollWidth)
              }
            />
          </li>
        </ul>
      </div>
    </div>
  );
}
