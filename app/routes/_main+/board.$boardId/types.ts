import type { Route } from "./+types/route";

export type Lists = Route.ComponentProps["loaderData"]["board"]["lists"];
export type List = Lists[number];
export type Cards = List["cards"];
export type Card = Cards[number];
