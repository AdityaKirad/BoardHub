import { z } from "zod";
import type { Route } from "./+types/create-board";
import { parseWithZod } from "@conform-to/zod";
import { db } from "~/.server/db";
import { board } from "~/.server/db/schema/workspace";
import { redirect } from "react-router";
import { requireUser } from "~/.server/session";

export const schema = z.object({
  title: z.string({ required_error: "👋 Board title is required" }),
});

export async function action({ request }: Route.ActionArgs) {
  const { id } = await requireUser(request);

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const [createdBoard] = await db
    .insert(board)
    .values({
      userId: id,
      title: submission.value.title,
      background: "blue",
    })
    .returning({ id: board.id });

  if (!createdBoard) {
    return;
  }

  return redirect(`/board/${createdBoard.id}`);
}
