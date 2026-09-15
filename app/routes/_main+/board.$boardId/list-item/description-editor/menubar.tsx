import { Separator } from "~/components/ui/separator";
import { TextTypeDropdown } from "./text-type-dropdown";
import { TextFormatControls } from "./text-format-control";
import { ListTypeDropdown } from "./list-type-dropdown";
import { InsertLinkPopover } from "./insert-link-popover";
import { InsertMenu } from "./insert-menu";
import type { Editor } from "@tiptap/react";

export function MenuBar({ editor }: { editor: Editor }) {
  return (
    <div className="bg-background flex gap-2 border-b p-2">
      <TextTypeDropdown editor={editor} />
      <Separator orientation="vertical" />
      <TextFormatControls editor={editor} />
      <Separator orientation="vertical" />
      <ListTypeDropdown editor={editor} />
      <Separator orientation="vertical" />
      <InsertLinkPopover editor={editor} />
      <InsertMenu editor={editor} />
    </div>
  );
}
