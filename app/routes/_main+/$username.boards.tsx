import type { Route } from "./+types/$username.boards";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { requireUser } from "~/.server/session";
import { ChevronLeftIcon, SquareKanbanIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Link, useFetcher } from "react-router";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { type action, schema } from "./create-board";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Field } from "~/components/ui/form";
import { useIsPending } from "~/hooks/use-is-pending";
import { db } from "~/.server/db";

export const meta: Route.MetaFunction = () => [{ title: "Boards | BoardHub" }];

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);

  const boards = await db.query.board.findMany({
    columns: { userId: false },
    where: (board, { eq }) => eq(board.userId, user.id),
  });

  return { boards };
}

export default function Page({ loaderData: { boards } }: Route.ComponentProps) {
  const fetcher = useFetcher<typeof action>();
  const isPending = useIsPending();
  const [createBoard, createBoardSet] = useState(false);
  const [dropdownOpen, dropdownOpenSet] = useState(false);
  const [form, fields] = useForm({
    id: "create-board",
    lastResult: fetcher.data,
    shouldValidate: "onBlur",
    constraint: getZodConstraint(schema),
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
  });
  return (
    <div className="grid auto-rows-[minmax(100px,auto)] gap-2 sm:grid-cols-4">
      {boards.map((board) => (
        <Link
          className="bg-card text-card-foreground flex flex-col overflow-hidden rounded-lg"
          key={board.id}
          to={`/board/${board.id}`}>
          <div className="flex-1" style={{ background: board.background }} />
          <div className="bg-card text-card-foreground p-2">{board.title}</div>
        </Link>
      ))}
      <DropdownMenu
        open={dropdownOpen}
        onOpenChange={(open) => {
          if (!open && createBoard) {
            createBoardSet(false);
          }
          dropdownOpenSet(open);
        }}>
        <DropdownMenuTrigger asChild>
          <Button className="h-auto" variant="outline">
            Create new board
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="px-0 py-3" side="right">
          {createBoard ? (
            <div className="px-3">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => createBoardSet(false)}>
                  <ChevronLeftIcon />
                </Button>
                <span>Create board</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => dropdownOpenSet(false)}>
                  <XIcon />
                </Button>
              </div>
              <fetcher.Form
                className="flex flex-col gap-2"
                method="POST"
                action="/create-board"
                {...getFormProps(form)}>
                <Field
                  labelProps={{ children: "Board title" }}
                  inputProps={getInputProps(fields.title, { type: "text" })}
                  errors={fields.title.errors}
                />

                <Button type="submit" disabled={isPending || !form.valid}>
                  Create
                </Button>
              </fetcher.Form>
            </div>
          ) : (
            <DropdownMenuItem
              className="rounded-none py-1.5 pl-4"
              onSelect={(evt) => {
                evt.preventDefault();
                createBoardSet(true);
              }}>
              <SquareKanbanIcon /> Create board
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
