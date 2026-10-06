import { z } from "zod";

export const booleanSchema = z.preprocess((val) => {
  if (typeof val === "string") {
    if (val === "true") {
      return true;
    }
    if (val === "false") {
      return false;
    }
    return val;
  }
}, z.boolean());

export type WithoutAction<T> = Omit<T, "action">;
