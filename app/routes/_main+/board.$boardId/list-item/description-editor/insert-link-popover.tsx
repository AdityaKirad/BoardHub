import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { LinkIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { z } from "zod";
import type { Editor } from "@tiptap/react";

const schema = z.object({
  link: z.string().url(),
  displayText: z.string().optional(),
});

export function InsertLinkPopover({ editor }: { editor: Editor }) {
  const [open, openSet] = useState(false);
  const [form, fields] = useForm({
    shouldValidate: "onBlur",
    constraint: getZodConstraint(schema),
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
    onSubmit(event, { formData }) {
      event.preventDefault();

      const { displayText, link } = Object.fromEntries(formData) as Record<
        string,
        string
      >;

      editor
        .chain()
        .insertContent({
          type: "text",
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          text: displayText || link,
          marks: [
            {
              type: "link",
              attrs: {
                href: link,
                target: "_blank",
              },
            },
          ],
        })
        .run();

      openSet(false);
    },
  });

  return (
    <Popover open={open} onOpenChange={openSet}>
      <PopoverTrigger asChild>
        <Button
          className="dark:hover:bg-border dark:focus-visible:bg-border px-2 py-0"
          variant="ghost">
          <LinkIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="[&_label]:mb-2" asChild>
        <form method="POST" {...getFormProps(form)}>
          <Field
            labelProps={{
              className: "gap-0",
              children: [
                "Link",
                <span key="required" className="text-destructive">
                  *
                </span>,
              ],
            }}
            inputProps={{
              ...getInputProps(fields.link, { type: "text" }),
              placeholder: "Paste a link",
            }}
            errors={fields.link.errors}
          />

          <Field
            labelProps={{
              children: "Display text (optional)",
            }}
            inputProps={{
              ...getInputProps(fields.displayText, { type: "text" }),
              placeholder: "Text to display",
            }}
            errors={fields.displayText.errors}>
            <p className="text-muted-foreground text-xs">
              Give this link a title or description
            </p>
          </Field>
          <div className="flex justify-end gap-4">
            <Button variant="ghost" onClick={() => openSet(false)}>
              Cancel
            </Button>
            <Button>Insert</Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
