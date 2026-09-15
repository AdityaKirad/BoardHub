import { ChevronDownIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { Editor } from "@tiptap/react";
import type { Level } from "@tiptap/extension-heading";
import { cn } from "~/lib/utils";

export function TextTypeDropdown({ editor }: { editor: Editor }) {
  const headingLevels = [
    { label: "Heading 1", level: 1, tag: "h1" },
    { label: "Heading 2", level: 2, tag: "h2" },
    { label: "Heading 3", level: 3, tag: "h3" },
    { label: "Heading 4", level: 4, tag: "h4" },
    { label: "Heading 5", level: 5, tag: "h6" },
    { label: "Heading 6", level: 6, tag: "h6" },
  ] as const;

  const setHeading = (level: Level) =>
    editor.chain().setHeading({ level }).run();
  const setParagraph = () => editor.chain().setParagraph().run();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="dark:hover:bg-border dark:focus-visible:bg-border px-1.5"
          variant="ghost">
          Tt <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60 rounded px-0 py-3">
        <DropdownMenuItem className="rounded-none py-2" onSelect={setParagraph}>
          Normal text
        </DropdownMenuItem>
        {headingLevels.map(({ label, level, tag: HeadingTag }) => (
          <DropdownMenuItem
            className={cn("rounded-none", {
              "py-1.5": level === 2,
              "py-2": level === 3 || level === 4 || level == 5 || level === 6,
            })}
            key={level}
            onSelect={() => setHeading(level)}>
            <HeadingTag
              className={cn(
                level < 5
                  ? "[font-size:revert] [font-weight:revert]"
                  : "text-xs font-medium",
              )}>
              {label}
            </HeadingTag>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
