import { requireUser } from "~/.server/session";
import type { Route } from "./+types/route";
import { schema } from "./board-action.schema";
import {
  handleCopyList,
  handleCreateList,
  handleMoveList,
  handleUpdateListTitle,
} from "./list-actions.server";
import {
  handleCreateCard,
  handleMoveCard,
  handleMoveCardsInThisList,
  handleToggleCardCompleted,
  handleUpdateCardTitle,
} from "./card-actions.server";
import { db } from "~/.server/db";
import { board } from "~/.server/db/schema/workspace";
import { eq } from "drizzle-orm";

export async function action({ params, request }: Route.ActionArgs) {
  await requireUser(request);

  const formData = await request.formData();

  const parsed = schema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return null;
  }

  switch (parsed.data.action) {
    case "copy-list":
      await handleCopyList({
        ...parsed.data,
        boardId: params.boardId,
      });
      break;
    case "create-list":
      await handleCreateList({ ...parsed.data, boardId: params.boardId });
      break;
    case "create-card":
      await handleCreateCard(parsed.data);
      break;
    case "move-list":
      await handleMoveList(parsed.data);
      break;
    case "move-card":
      await handleMoveCard(parsed.data);
      break;
    case "move-cards-in-this-list":
      await handleMoveCardsInThisList(parsed.data);
      break;
    case "update-board-title":
      await updateBoardTitle({ ...parsed.data, boardId: params.boardId });
      break;
    case "update-list-title":
      await handleUpdateListTitle(parsed.data);
      break;
    case "update-card-title":
      await handleUpdateCardTitle(parsed.data);
      break;
    case "toggle-card-completion":
      await handleToggleCardCompleted(parsed.data);
      break;
    default:
      break;
  }

  return null;
}

const updateBoardTitle = ({
  boardId,
  title,
}: {
  boardId: string;
  title: string;
}) =>
  db
    .update(board)
    .set({
      title,
    })
    .where(eq(board.id, boardId));
