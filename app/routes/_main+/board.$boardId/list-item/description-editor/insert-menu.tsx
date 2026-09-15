import { ChevronDownIcon, PlusIcon } from "lucide-react";
import { lazy, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { Editor } from "@tiptap/react";

const EmojiPicker = lazy(() => import("emoji-picker-react"));

export function InsertMenu({ editor }: { editor: Editor }) {
  const [dropdownOpen, dropdownOpenSet] = useState(false);
  const [showEmojiPicker, showEmojiPickerSet] = useState(false);

  const toggleCodeBlock = () => editor.chain().toggleCodeBlock().run();

  return (
    <>
      <DropdownMenu
        open={dropdownOpen}
        onOpenChange={(open) => {
          if (!open && showEmojiPicker) {
            showEmojiPickerSet(false);
          }
          dropdownOpenSet(open);
        }}>
        <DropdownMenuTrigger asChild>
          <Button
            className="dark:hover:bg-border dark:focus-visible:bg-border px-2 py-0"
            variant="ghost">
            <PlusIcon />
            <ChevronDownIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48 rounded px-0 py-3 *:[div[data-slot=dropdown-menu-item]]:rounded-none *:[div[data-slot=dropdown-menu-item]]:py-2">
          {showEmojiPicker ? (
            <EmojiPicker />
          ) : (
            <>
              <DropdownMenuItem onClick={() => showEmojiPickerSet(true)}>
                Emoji
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={toggleCodeBlock}>
                Code snippet
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
