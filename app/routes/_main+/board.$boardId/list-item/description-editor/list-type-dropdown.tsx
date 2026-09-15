import { ChevronDownIcon, ListIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { Editor } from "@tiptap/react";

export function ListTypeDropdown({ editor }: { editor: Editor }) {
  const toggleList = () => editor.chain().toggleBulletList().run();
  const toggleNumberedList = () => editor.chain().toggleOrderedList().run();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="dark:hover:bg-border dark:focus-visible:bg-border px-2 py-0"
          variant="ghost">
          <ListIcon />
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 rounded px-0 py-3 *:[div[data-slot=dropdown-menu-item]]:rounded-none *:[div[data-slot=dropdown-menu-item]]:py-2">
        <DropdownMenuItem onSelect={toggleList}>Bullet list</DropdownMenuItem>
        <DropdownMenuItem onSelect={toggleNumberedList}>
          Numbered list
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
