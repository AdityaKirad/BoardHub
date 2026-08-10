import { Form } from "react-router";
import { CircleIcon, CircleCheckIcon } from "lucide-react";
import type { CardSelectType } from "~/.server/db/schema/workspace";

export default function ListCard({
  card,
}: {
  card: Pick<CardSelectType, "id" | "title" | "completed">;
}) {
  return (
    <Form
      className="group bg-input flex h-9 items-center gap-2 rounded-lg px-2"
      method="POST">
      <input type="hidden" name="cardId" value={card.id} />
      {
        <button
          className="opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
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
    </Form>
  );
}
