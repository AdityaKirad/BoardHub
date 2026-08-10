import { useState } from "react";
import { Form } from "react-router";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { PlusIcon, XIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
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
  return (
    <Card className="max-h-[calc(100%-3rem)] min-w-0 shrink-0 basis-64 [--card-spacing:--spacing(2)]">
      <CardHeader className="flex items-center">
        <span>{list.title}</span>
        {list.cards.length}
      </CardHeader>
      <CardContent className="space-y-1 overflow-y-auto">
        {list.cards.map((card) => (
          <ListCard key={card.id} card={card} />
        ))}
      </CardContent>
      <CardFooter>
        {createCard ? (
          <Form method="POST">
            <Textarea
              placeholder="Enter a title or paste a link"
              name="title"
            />
            <input type="hidden" name="listId" value={list.id} />
            <div className="flex gap-2">
              <Button type="submit" name="action" value="create-card">
                Add card
              </Button>
              <Button size="icon" onClick={() => createCardSet(false)}>
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
      </CardFooter>
    </Card>
  );
}
