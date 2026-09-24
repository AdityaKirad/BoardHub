import { createId } from "@paralleldrive/cuid2";
import { generateKeyBetween } from "fractional-indexing";
import { ACTIONS } from "../../action";
import { useListContext } from "../list-context";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

export function CopyListFormContent({ onEscape }: { onEscape: () => void }) {
  const { list, nextListPosition } = useListContext();
  return (
    <>
      <div>
        <Label htmlFor="title">Title</Label>
        <Textarea
          id="title"
          name="title"
          className="mt-2 min-h-16 resize-none"
          defaultValue={list.title}
          onKeyDown={(evt) => {
            if (evt.key === "Enter") {
              evt.preventDefault();
            } else if (evt.key === "Escape") {
              onEscape();
            }
          }}
        />
      </div>

      <input
        type="hidden"
        name="position"
        value={generateKeyBetween(list.position, nextListPosition)}
      />
      <input type="hidden" name="sourceListId" value={list.id} />
      <input type="hidden" name="id" value={createId()} />
      <input type="hidden" name="action" value={ACTIONS.COPY_LIST} />
    </>
  );
}
