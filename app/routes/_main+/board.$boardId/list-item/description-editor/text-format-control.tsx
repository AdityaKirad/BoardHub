import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";
import { BoldIcon, ItalicIcon, MoreHorizontalIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Toggle } from "~/components/ui/toggle";

export function TextFormatControls({ editor }: { editor: Editor }) {
  const editorState = useEditorState({
    editor,
    selector: (context) => ({
      isBold: context.editor.isActive("bold") ?? false,
      isItalic: context.editor.isActive("italic") ?? false,
    }),
  });

  const clearFormatting = () => editor.chain().unsetAllMarks().run();
  const toggleCode = () => editor.chain().toggleCode().run();
  const toggleBold = () => editor.chain().toggleBold().run();
  const toggleItalic = () => editor.chain().toggleItalic().run();
  const toggleStrikethrough = () => editor.chain().toggleStrike().run();

  return (
    <div className="[&>button]:dark:hover:bg-border [&>button]:data-[state=on]:bg-primary/50 [&>button]:dark:focus-visible:bg-border flex gap-2 [&>button]:h-fit [&>button]:min-w-fit [&>button]:p-1.5">
      <Toggle pressed={editorState.isBold} onPressedChange={toggleBold}>
        <BoldIcon />
      </Toggle>
      <Toggle pressed={editorState.isItalic} onPressedChange={toggleItalic}>
        <ItalicIcon />
      </Toggle>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="rounded-lg" variant="ghost">
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48 rounded px-0 py-3 *:[div[data-slot=dropdown-menu-item]]:rounded-none *:[div[data-slot=dropdown-menu-item]]:py-2">
          <DropdownMenuItem onSelect={toggleStrikethrough}>
            Strikethrough
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={toggleCode}>Code</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={clearFormatting}>
            Clear formatting
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
