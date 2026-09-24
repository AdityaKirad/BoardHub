import { ChevronLeftIcon, MoreHorizontalIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ACTIONS } from "../../action";
import { useListContext } from "../list-context";
import { CopyListFormContent } from "./copy-list-form-content";
import { MoveListFormContent } from "./move-list-form-content";
import { MoveAllCardsInThisFormContent } from "./move-all-cards-in-this-form-content";
import { cn } from "~/lib/utils";
import { SortByFormContent } from "./sort-by-form-content";

type DROPDOWN_ACTIONS = keyof Pick<
  typeof ACTIONS,
  "COPY_LIST" | "MOVE_CARDS_IN_THIS_LIST" | "MOVE_LIST" | "SORT_LIST"
>;

const actionConfig: Record<
  DROPDOWN_ACTIONS,
  {
    Component: React.ComponentType<{ onEscape: () => void }>;
    title: string;
    submitLabel?: string;
  }
> = {
  COPY_LIST: {
    Component: CopyListFormContent,
    title: "Copy list",
    submitLabel: "Create",
  },
  MOVE_LIST: {
    Component: MoveListFormContent,
    title: "Move list",
    submitLabel: "Move",
  },
  MOVE_CARDS_IN_THIS_LIST: {
    Component: MoveAllCardsInThisFormContent,
    title: "Move all cards in this list",
  },
  SORT_LIST: {
    Component: SortByFormContent,
    title: "Sort by",
  },
};

export function ListActionDropdown() {
  const { list, openCreateCard } = useListContext();
  const [open, openSet] = useState(false);
  const [action, actionSet] = useState<DROPDOWN_ACTIONS | null>(null);
  const fetcher = useFetcher();

  function handleDropdownMenuItemSelect(action: DROPDOWN_ACTIONS) {
    return (evt: Event) => {
      evt.preventDefault();
      actionSet(action);
    };
  }

  function handleSubmit(evt: React.SubmitEvent<HTMLFormElement>) {
    evt.preventDefault();

    const formData = new FormData(evt.currentTarget, evt.nativeEvent.submitter);

    void fetcher.submit(formData, {
      method: "POST",
    });

    openSet(false);
  }

  function submitListAction(action: string) {
    return () => {
      const formData = new FormData();

      formData.append("action", action);
      formData.append("id", list.id);

      void fetcher.submit(formData, {
        method: "POST",
      });
    };
  }

  return (
    <DropdownMenu open={open} onOpenChange={openSet}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-60 px-0 py-3 *:data-[slot=dropdown-menu-item]:rounded-none *:data-[slot=dropdown-menu-item]:p-2"
        onAnimationEnd={(evt) => {
          if (!open && action && evt.target === evt.currentTarget) {
            actionSet(null);
          }
        }}
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
            {action ? actionConfig[action].title : "List actions"}
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
            {(() => {
              const { Component, submitLabel } = actionConfig[action];
              return (
                <>
                  <Component onEscape={() => actionSet(null)} />
                  {submitLabel && (
                    <Button className="w-fit" type="submit">
                      {submitLabel}
                    </Button>
                  )}
                </>
              );
            })()}
          </fetcher.Form>
        ) : (
          <>
            <DropdownMenuItem onSelect={() => openCreateCard(0)}>
              Add card
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={handleDropdownMenuItemSelect("COPY_LIST")}>
              Copy list
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={handleDropdownMenuItemSelect("MOVE_LIST")}>
              Move list
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={handleDropdownMenuItemSelect(
                "MOVE_CARDS_IN_THIS_LIST",
              )}>
              Move all cards in this list
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={handleDropdownMenuItemSelect("SORT_LIST")}>
              Sort by
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={submitListAction(ACTIONS.TOGGLE_PIN_LIST)}>
              {list.pinned ? "Unpin list" : "Pin list"}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="mx-2" />
            <DropdownMenuItem onSelect={submitListAction(ACTIONS.ARCHIVE_LIST)}>
              Archive this list
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={submitListAction(ACTIONS.ARCHIVE_ALL_CARD_IN_LIST)}>
              Archive all cards in this list
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
