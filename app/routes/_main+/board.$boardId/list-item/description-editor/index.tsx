import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { all, createLowlight } from "lowlight";
import { ChevronRightIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Collapsible, CollapsibleContent } from "~/components/ui/collapsible";
import { cn } from "~/lib/utils";
import { MenuBar } from "./menubar";

const lowlight = createLowlight(all);

export function DescriptionEditor() {
  const [open, openSet] = useState(true);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        enableTabIndentation: true,
        tabSize: 2,
      }),
    ],
    content: "<p>Hello World!</p>",
  });

  return (
    <div className="grid flex-1 grid-cols-[max-content_1fr] grid-rows-[auto_1fr] gap-x-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => openSet((prev) => !prev)}>
        <ChevronRightIcon
          className={cn("transition-transform", { "rotate-90": open })}
        />
      </Button>

      <span className="self-center font-medium">Description</span>

      <Collapsible className="col-2 row-2" open={open} onOpenChange={openSet}>
        <CollapsibleContent className="data-open:animate-collapsible-down data-closed:animate-collapsible-up h-full">
          <div className="focus-within:border-primary flex h-full flex-col overflow-hidden rounded-lg border-2 transition-colors">
            <MenuBar editor={editor} />
            <EditorContent className="flex-1 p-4" editor={editor} />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
