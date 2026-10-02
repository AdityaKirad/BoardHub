import { Form } from "react-router";
import { useListContext } from "./list-context";
import { ACTIONS } from "../action";
import { Button } from "~/components/ui/button";
import { ArrowsOutwardIcon } from "~/components/icons/arrows-outward";
import { ArrowsInwardIcon } from "~/components/icons/arrows-inward";

export function ListCollapse() {
  const { list } = useListContext();
  return (
    <Form
      className={list.collapsed ? "order-0" : ""}
      method="POST"
      navigate={false}>
      <input type="hidden" name="action" value={ACTIONS.TOGGLE_COLLAPSE_LIST} />
      <input type="hidden" name="id" value={list.id} />

      <Button type="submit" variant="ghost" size="icon">
        {list.collapsed ? <ArrowsOutwardIcon /> : <ArrowsInwardIcon />}
      </Button>
    </Form>
  );
}
