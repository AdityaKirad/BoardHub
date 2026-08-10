import { CircleIcon } from "lucide-react";
import type { CardSelectType } from "~/.server/db/schema/workspace";

export default function ListCard({
  card,
}: {
  card: Pick<CardSelectType, "id" | "title" | "completed">;
}) {
  return (
    <div className="group bg-input flex h-9 items-center gap-2 rounded-lg px-2">
      <input type="hidden" name="cardId" value={card.id} />

      <CircleIcon
        className="opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
        width={16}
        height={16}
      />
      <span className="-translate-x-6 transition-transform duration-300 ease-out group-hover:translate-x-0">
        {card.title}
      </span>
    </div>
  );
}
