import { ArrowsInwardIcon } from "~/components/icons/arrows-inward";
import { ArrowsOutwardIcon } from "~/components/icons/arrows-outward";
import { Button } from "~/components/ui/button";
import { Form } from "react-router";
import { ACTIONS } from "../action";
import { useListContext } from "./list-context";

export function ListCollapse() {
  const { list } = useListContext();

  return (
    <Form method="POST" navigate={false}>
      <input type="hidden" name="action" value={ACTIONS.TOGGLE_COLLAPSE_LIST} />
      <input type="hidden" name="id" value={list.id} />
      <input type="hidden" name="collapsed" value={String(!list.collapsed)} />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        title={list.collapsed ? "Expand list" : "Collapse list"}
        aria-label={list.collapsed ? "Expand list" : "Collapse list"}>
        {list.collapsed ? <ArrowsOutwardIcon /> : <ArrowsInwardIcon />}
      </Button>
    </Form>
  );
}
