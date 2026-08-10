import { useState } from "react";
import { Form } from "react-router";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { PlusIcon, XIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import type {
  CardSelectType,
  ListSelectType,
} from "~/.server/db/schema/workspace";
import ListCard from "./card";

export default function List({
  list,
}: {
  list: Pick<ListSelectType, "id" | "title"> & { cards: CardSelectType[] };
}) {
  const [createCard, createCardSet] = useState(false);
  const [editCardTitle, editCardTitleSet] = useState(false);
  return (
    <Card className="max-h-[calc(100%-3rem)] min-w-0 shrink-0 basis-64 [--card-spacing:--spacing(2)]">
      <CardHeader className="flex items-center">
        {editCardTitle ? (
          <Form className="flex-1" method="POST">
            <input type="hidden" name="listId" value={list.id} />
            <input type="hidden" name="action" value="update-list-title" />
            <Textarea
              className="resize-none"
              name="title"
              defaultValue={list.title}
              onKeyDown={(evt) => {
                if (evt.key === "Enter") {
                  evt.preventDefault();
                  editCardTitleSet(false);
                  (evt.target as HTMLTextAreaElement).form?.requestSubmit();
                }
              }}
            />
          </Form>
        ) : (
          <button
            className="h-8 flex-1 px-3 text-left"
            onClick={() => editCardTitleSet(true)}>
            {list.title}
          </button>
        )}
        {list.cards.length}
      </CardHeader>
      <CardContent className="space-y-2 overflow-y-auto">
        {list.cards.map((card) => (
          <ListCard key={card.id} card={card} />
        ))}
        {createCard ? (
          <Form className="space-y-2" method="POST">
            <Textarea
              className="min-h-10 resize-none focus-visible:border-none focus-visible:ring-0"
              placeholder="Enter a title or paste a link"
              name="title"
            />
            <input type="hidden" name="listId" value={list.id} />
            <div className="flex gap-2">
              <Button type="submit" name="action" value="create-card">
                Add card
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => createCardSet(false)}>
                <XIcon />
              </Button>
            </div>
          </Form>
        ) : (
          <Button
            className="justify-start"
            variant="ghost"
            onClick={() => createCardSet(true)}>
            <PlusIcon /> Create card
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
