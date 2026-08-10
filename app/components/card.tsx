import { Form } from "react-router";
import { CircleIcon, CircleCheckIcon, EditIcon } from "lucide-react";
import type { CardSelectType } from "~/.server/db/schema/workspace";
import { Button } from "./ui/button";

export default function ListCard({
  card,
}: {
  card: Pick<CardSelectType, "id" | "title" | "completed">;
}) {
  return (
    <Form
      className="group bg-input focus-within:outline-primary flex h-9 items-center gap-2 rounded-lg px-2 focus-within:outline-2 focus-within:outline-offset-1 focus-within:[&>span]:translate-x-0"
      method="POST">
      <input type="hidden" name="cardId" value={card.id} />
      {
        <button
          className="opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 focus-visible:opacity-100"
          type="submit"
          name="action"
          value="toggle-card-completed"
          title={card.completed ? "Mark as incomplete" : "Mark as complete"}>
          {card.completed ? (
            <CircleCheckIcon width={16} height={16} />
          ) : (
            <CircleIcon width={16} height={16} />
          )}
        </button>
      }

      <span className="-translate-x-6 transition-transform duration-300 ease-out group-hover:translate-x-0">
        {card.title}
      </span>

      <Button
        className="ml-auto rounded opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 focus-visible:opacity-100"
        variant="outline"
        size="icon">
        <EditIcon />
      </Button>
    </Form>
  );
}
