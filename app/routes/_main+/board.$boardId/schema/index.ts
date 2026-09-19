import { z } from "zod";
import { cardSchemas } from "./card";
import { listSchemas } from "./list";
import { ACTIONS } from "../action";

export const schema = z.discriminatedUnion("action", [
  ...listSchemas,
  ...cardSchemas,
  z.object({
    action: z.literal(ACTIONS.UPDATE_BOARD_TITLE),
    title: z.string(),
  }),
]);
