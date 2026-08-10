import { requireUser } from "~/.server/session";
import type { Route } from "./+types/board.$boardId";
import { db } from "~/.server/db";
import { Button } from "~/components/ui/button";
import { PlusIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Form } from "react-router";
import { z } from "zod";
import { card, list } from "~/.server/db/schema/workspace";
import { sql } from "drizzle-orm";
import { Textarea } from "~/components/ui/textarea";
import List from "../../components/list";

const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("create-list"),
    title: z.string(),
  }),
  z.object({
    action: z.literal("create-card"),
    title: z.string(),
    listId: z.string(),
  }),
]);

export const meta: Route.MetaFunction = ({ loaderData: { board } }) => [
  { title: `${board?.title} | BoardHub` },
];

export async function loader({ params, request }: Route.LoaderArgs) {
  await requireUser(request);

  const board = await db.query.board.findFirst({
    with: { lists: { with: { cards: true } } },
    where: (board, { eq }) => eq(board.id, params.boardId),
  });

  return { board };
}

export async function action({ params, request }: Route.ActionArgs) {
  await requireUser(request);

  const formData = await request.formData();

  const parsed = schema.safeParse(formData);

  if (!parsed.success) {
    console.log("schema parsing failed: ", parsed.error);
    return null;
  }

  const { action } = parsed.data;

  if (action === "create-list") {
    await db.insert(list).values({
      ...parsed.data,
      boardId: params.boardId,
      position: sql`(SELECT COALESCE(MAX(${list.position}), 0) + 1 FROM ${list} WHERE ${list.boardId} = ${params.boardId} )`,
    });
  } else if (action === "create-card") {
    await db.insert(card).values({
      ...parsed.data,
      position: sql`(SELECT COALESCE(MAX(${card.position}), 0) + 1 FROM ${card} WHERE ${card.listId} = ${parsed.data.listId})`,
    });
  }

  return null;
}

export default function Page({ loaderData: { board } }: Route.ComponentProps) {
  const [createList, createListSet] = useState(false);
  return (
    <div className="relative h-[calc(100vh-5.05rem)] supports-[height:100dvh]:h-[calc(100dvh-5.05rem)]">
      <div
        className="absolute inset-0 flex flex-col rounded-xl border"
        style={{ background: board?.background }}>
        <div className="bg-background/50 p-4 font-bold">{board?.title}</div>
        <div className="flex w-full items-start gap-4 overflow-x-auto overflow-y-hidden p-2">
          {board?.lists.map((list) => (
            <List key={list.id} list={list} />
          ))}
          {createList ? (
            <Form
              className="bg-card min-w-0 shrink-0 basis-64 space-y-2 rounded-lg p-2"
              method="POST">
              <Textarea
                className="min-h-0 resize-none"
                placeholder="Enter list name..."
                name="title"
              />
              <div className="flex gap-2">
                <Button type="submit" name="action" value="create-list">
                  Add list
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => createListSet(false)}>
                  <XIcon />
                </Button>
              </div>
            </Form>
          ) : (
            <Button
              className="min-w-0 shrink-0 basis-64 rounded-lg bg-white/60 hover:bg-white/70 focus-visible:bg-white/70 focus-visible:outline-white/70"
              size="lg"
              onClick={() => createListSet(true)}>
              <PlusIcon />{" "}
              {board?.lists.length ? "Add another list" : "Add list"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
