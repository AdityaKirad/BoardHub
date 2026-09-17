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
import type { ACTIONS } from "../../action";
import { useListContext } from "../list-context";
import { CopyListFormContent } from "./copy-list-form-content";
import { MoveListFormContent } from "./move-list-form-content";
import { MoveAllCardsInThisFormContent } from "./move-all-cards-in-this-form-content";
import { cn } from "~/lib/utils";

type DROPDOWN_ACTIONS = keyof Pick<
  typeof ACTIONS,
  "COPY_LIST" | "MOVE_CARDS_IN_THIS_LIST" | "MOVE_LIST" | "SORT_BY"
>;

const actionTitle: Record<DROPDOWN_ACTIONS, string> = {
  COPY_LIST: "Copy list",
  MOVE_LIST: "Move list",
  MOVE_CARDS_IN_THIS_LIST: "Move all cards in this list",
  SORT_BY: "Sort by",
};

export function ListActionDropdown() {
  const { openCreateCard } = useListContext();
  const [open, openSet] = useState(false);
  const [action, actionSet] = useState<DROPDOWN_ACTIONS | null>(null);
  const fetcher = useFetcher();

  function handleDropdownMenuItemSelect(evt: Event, action: DROPDOWN_ACTIONS) {
    evt.preventDefault();
    actionSet(action);
  }

  function handleSubmit(evt: React.SubmitEvent<HTMLFormElement>) {
    evt.preventDefault();

    const formData = new FormData(evt.currentTarget, evt.nativeEvent.submitter);

    void fetcher.submit(formData, {
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
        {action ? (
          <fetcher.Form
            method="POST"
            className={cn("flex flex-col gap-2", {
              "px-2": action !== "MOVE_CARDS_IN_THIS_LIST",
            })}
            onSubmit={handleSubmit}>
            {action === "COPY_LIST" ? (
              <CopyListFormContent onEscape={() => actionSet(null)} />
            ) : action === "MOVE_LIST" ? (
              <MoveListFormContent />
            ) : (
              <MoveAllCardsInThisFormContent />
            )}
            {action !== "MOVE_CARDS_IN_THIS_LIST" && (
              <Button className="w-fit" type="submit">
                {action === "COPY_LIST" ? "Create" : "Move"}
              </Button>
            )}
          </fetcher.Form>
        ) : (
          <>
            <DropdownMenuItem onSelect={() => openCreateCard(0)}>
              Add card
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(evt) =>
                handleDropdownMenuItemSelect(evt, "COPY_LIST")
              }>
              Copy list
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(evt) =>
                handleDropdownMenuItemSelect(evt, "MOVE_LIST")
              }>
              Move list
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(evt) =>
                handleDropdownMenuItemSelect(evt, "MOVE_CARDS_IN_THIS_LIST")
              }>
              Move all cards in this list
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
