import { ChevronLeftIcon, MoreHorizontalIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { ACTIONS } from "../action";
import { generateKeyBetween } from "fractional-indexing";
import { createId } from "@paralleldrive/cuid2";
import { useListContext } from "./list-context";

type DROPDOWN_ACTIONS = keyof Pick<
  typeof ACTIONS,
  "COPY_LIST" | "MOVE_CARDS_IN_LIST" | "MOVE_LIST" | "SORT_BY"
>;

const actionTitle: Record<DROPDOWN_ACTIONS, string> = {
  COPY_LIST: "Copy list",
  MOVE_LIST: "Move list",
  MOVE_CARDS_IN_LIST: "Move all cards in this list",
  SORT_BY: "Sort by",
};

export function ListActionDropdown() {
  const [open, openSet] = useState(false);
  const [action, actionSet] = useState<DROPDOWN_ACTIONS | null>(null);
  const { list, nextListPosition, openCreateCard } = useListContext();
  const fetcher = useFetcher();

  function handleCopyList(evt: React.SubmitEvent<HTMLFormElement>) {
    evt.preventDefault();

    void fetcher.submit(evt.currentTarget, {
      method: "POST",
      flushSync: true,
    });

    openSet(false);
  }
  return (
    <DropdownMenu open={open} onOpenChange={openSet}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-60 px-0 py-3 *:[div[data-slot=dropdown-menu-item]]:rounded-none *:[div[data-slot=dropdown-menu-item]]:py-2"
        onAnimationEnd={(evt) =>
          !open && action && evt.target === evt.currentTarget && actionSet(null)
        }
        onEscapeKeyDown={(evt) => {
          evt.preventDefault();
          if (action) {
            actionSet(null);
            return;
          }
          openSet(false);
        }}>
        <div className="mb-2 flex items-center">
          {action && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => actionSet(null)}>
              <ChevronLeftIcon />
            </Button>
          )}
          <p className="flex-1 text-center text-sm font-medium">
            {action ? actionTitle[action] : "List actions"}
          </p>
          <Button variant="ghost" size="icon-sm" onClick={() => openSet(false)}>
            <XIcon />
          </Button>
        </div>
        {action === "COPY_LIST" ? (
          <fetcher.Form
            method="POST"
            className="px-2"
            onSubmit={handleCopyList}>
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
                    actionSet(null);
                  }
                }}
              />
            </div>

            <input
              type="hidden"
              name="position"
              value={generateKeyBetween(list.position, nextListPosition)}
            />
            <input type="hidden" name="listId" value={list.id} />
            <input type="hidden" name="newListId" value={createId()} />
            <input type="hidden" name="action" value={ACTIONS.COPY_LIST} />

            <Button className="mt-2" type="submit">
              Create
            </Button>
          </fetcher.Form>
        ) : (
          <>
            <DropdownMenuItem onSelect={() => openCreateCard(0)}>
              Add card
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(evt) => {
                evt.preventDefault();
                actionSet("COPY_LIST");
              }}>
              Copy list
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
