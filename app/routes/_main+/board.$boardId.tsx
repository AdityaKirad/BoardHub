import { requireUser } from "~/.server/session";
import type { Route } from "./+types/board.$boardId";
import { db } from "~/.server/db";
import { Button } from "~/components/ui/button";
import { CircleIcon, PlusIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Form } from "react-router";
import {
  getFormProps,
  getInputProps,
  useForm,
  type SubmissionResult,
} from "@conform-to/react";
import { z } from "zod";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Field } from "~/components/ui/form";
import {
  card,
  list,
  type CardSelectType,
  type ListSelectType,
} from "~/.server/db/schema/workspace";
import { sql } from "drizzle-orm";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";

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
  const { user } = await requireUser(request);

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  if (submission.value.action === "create-list") {
    await db.insert(list).values({
      boardId: params.boardId,
      title: submission.value.title,
      position: sql`(SELECT COALESCE(MAX(${list.position}), 0) + 1 FROM ${list} WHERE ${list.boardId} = ${params.boardId} )`,
    });
  } else if (submission.value.action === "create-card") {
    await db.insert(card).values({
      listId: submission.value.listId,
      title: submission.value.title,
      position: sql`(SELECT COALESCE(MAX(${card.position}), 0) + 1 FROM ${card} WHERE ${card.listId} = ${submission.value.listId})`,
    });
  }

  return submission.reply({ resetForm: true });
}

export default function Page({
  actionData,
  loaderData: { board },
}: Route.ComponentProps) {
  const [createList, createListSet] = useState(false);
  const [form, fields] = useForm({
    id: "create-list",
    lastResult: actionData,
    constraint: getZodConstraint(schema),
    shouldValidate: "onBlur",
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
  });
  return (
    <div className="relative h-[calc(100vh-5.05rem)] supports-[height:100dvh]:h-[calc(100dvh-5.05rem)]">
      <div
        className="absolute inset-0 rounded-xl border"
        style={{ background: board?.background }}>
        <div className="bg-background/50 p-4 font-bold">{board?.title}</div>
        <div className="flex h-[calc(100%-7rem)] w-full items-start gap-4 overflow-x-auto overflow-y-hidden px-3 py-2">
          {board?.lists.map((list) => (
            <List key={list.id} list={list} lastResult={actionData} />
          ))}
          {createList ? (
            <Form method="POST" {...getFormProps(form)}>
              <Field
                inputProps={{
                  ...getInputProps(fields.title, { type: "text" }),
                  placeholder: "Enter list name...",
                }}
                errors={fields.title.errors}
              />
              <div className="flex gap-2">
                <Button type="submit" name="action" value="create-list">
                  Add list
                </Button>
                <Button size="icon" onClick={() => createListSet(false)}>
                  <XIcon />
                </Button>
              </div>
            </Form>
          ) : (
            <Button onClick={() => createListSet(true)}>
              <PlusIcon />{" "}
              {board?.lists.length ? "Add another list" : "Add list"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function List({
  lastResult,
  list,
}: {
  lastResult: SubmissionResult<string[]> | null | undefined;
  list: Pick<ListSelectType, "id" | "title"> & { cards: CardSelectType[] };
}) {
  const [createCard, createCardSet] = useState(false);
  const [editCardTitle, editCardTitleSet] = useState(false);
  const [form, fields] = useForm({
    lastResult,
    id: "create-card",
    constraint: getZodConstraint(schema),
    shouldValidate: "onBlur",
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
  });
  return (
    <Card className="min-h-0 w-64 shrink-0 overflow-y-auto">
      <CardHeader className="flex items-center">
        {editCardTitle ? (
          <Textarea className="resize-none" defaultValue={list.title} />
        ) : (
          <button
            className="h-8 flex-1 text-left"
            onClick={() => editCardTitleSet(true)}>
            {list.title}
          </button>
        )}
        {list.cards.length}
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {list.cards.map((card) => (
          <div
            className="group bg-input flex h-9 items-center gap-2 rounded-lg px-2"
            key={card.id}>
            <CircleIcon
              className="opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
              width={16}
              height={16}
            />
            <span className="-translate-x-6 transition-transform duration-300 ease-out group-hover:translate-x-0">
              {card.title}
            </span>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        {createCard ? (
          <Form method="POST" {...getFormProps(form)}>
            <Field
              inputProps={{
                ...getInputProps(fields.title, { type: "text" }),
                placeholder: "Enter a title or paste a link",
              }}
              errors={fields.title.errors}
            />
            <input type="hidden" name="listId" value={list.id} />
            <div className="flex gap-2">
              <Button type="submit" name="action" value="create-card">
                Add card
              </Button>
              <Button size="icon" onClick={() => createCardSet(false)}>
                <XIcon />
              </Button>
            </div>
          </Form>
        ) : (
          <Button
            className="justify-start"
            variant="ghost"
            onClick={() => createCardSet(true)}>
            <PlusIcon /> Create card
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
