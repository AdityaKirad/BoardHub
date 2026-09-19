import { Form } from "react-router";
import { useListContext } from "./list-context";
import { Button } from "~/components/ui/button";
import { PinIcon } from "lucide-react";
import { ACTIONS } from "../action";

export function ListPin() {
  const { list } = useListContext();
  if (list.pinned) {
    return (
      <Form method="POST">
        <input type="hidden" name="action" value={ACTIONS.TOGGLE_PIN_LIST} />
        <input type="hidden" name="id" value={list.id} />

        <Button type="submit" variant="ghost" size="icon">
          <PinIcon fill="currentColor" />
        </Button>
      </Form>
    );
  }
}
