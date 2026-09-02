import { CircleCheckIcon, CircleIcon, Edit } from "lucide-react";

export function ListItemPreview({
  title,
  completed,
}: {
  title: string;
  completed: boolean;
}) {
  return (
    <li className="bg-input flex min-h-9 gap-2 rounded-lg p-2 shadow-xl">
      <span className="p-2">
        {completed ? (
          <CircleCheckIcon width={16} height={16} />
        ) : (
          <CircleIcon width={16} height={16} />
        )}
      </span>
      <span>{title}</span>
      <span className="p-2">
        <Edit width={16} height={16} />
      </span>
    </li>
  );
}
