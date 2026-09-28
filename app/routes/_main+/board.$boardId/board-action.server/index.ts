import { requireUser } from "~/.server/session";
import type { Route } from "../+types/route";
import { schema } from "../schema";
import {
  handleArchiveList,
  handleCopyList,
  handleCreateList,
  handleMoveList,
  handleTogglePinList,
  handleUpdateListTitle,
} from "./list";
import {
  handleArchiveAllCardInList,
  handleArchiveCard,
  handleCreateCard,
  handleMoveCard,
  handleMoveCardsInThisList,
  handleSortList,
  handleToggleCardCompleted,
  handleUpdateCardTitle,
} from "./card";
import { db } from "~/.server/db";
import { board } from "~/.server/db/schema/workspace";
import { and, eq } from "drizzle-orm";
import { parseWithZod } from "@conform-to/zod";

export async function action({ params, request }: Route.ActionArgs) {
  const { id: userId } = await requireUser(request);

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return null;
  }

  switch (submission.value.action) {
    case "archive-card":
      await handleArchiveCard(userId, submission.value);
      break;
    case "archive-all-card-in-list":
      await handleArchiveAllCardInList(userId, submission.value);
      break;
    case "archive-list":
      await handleArchiveList(userId, submission.value);
      break;
    case "copy-list":
      await handleCopyList(userId, submission.value);
      break;
    case "create-list":
      await handleCreateList(userId, {
        ...submission.value,
        boardId: params.boardId,
      });
      break;
    case "create-card":
      await handleCreateCard(userId, submission.value);
      break;
    case "move-list":
      await handleMoveList(userId, submission.value);
      break;
    case "move-card":
      await handleMoveCard(userId, submission.value);
      break;
    case "move-cards-in-this-list":
      await handleMoveCardsInThisList(userId, submission.value);
      break;
    case "sort-list":
      await handleSortList(userId, submission.value);
      break;
    case "update-board-title":
      await updateBoardTitle(userId, {
        ...submission.value,
        boardId: params.boardId,
      });
      break;
    case "update-list-title":
      await handleUpdateListTitle(userId, submission.value);
      break;
    case "update-card-title":
      await handleUpdateCardTitle(userId, submission.value);
      break;
    case "toggle-card-completion":
      await handleToggleCardCompleted(userId, submission.value);
      break;
    case "toggle-pin-list":
      await handleTogglePinList(userId, submission.value);
      break;
    default:
      break;
  }

  return null;
}

const updateBoardTitle = (
  userId: string,
  {
    boardId,
    title,
  }: {
    boardId: string;
    title: string;
  },
) =>
  db
    .update(board)
    .set({
      title,
    })
    .where(and(eq(board.id, boardId), eq(board.userId, userId)));
