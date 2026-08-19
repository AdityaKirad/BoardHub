import { generateKeyBetween } from "fractional-indexing";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const getPositionAtIndex = (
  items: { position: string }[],
  index: number,
) => {
  const clampedIndex = clamp(index, 0, items.length);
  const before = items[clampedIndex - 1]?.position ?? null;
  const after = items[clampedIndex]?.position ?? null;

  return {
    before,
    after,
    position: generateKeyBetween(before, after),
  };
};

export const isAlreadyBetween = ({
  after,
  before,
  position,
}: {
  after: string | null;
  before: string | null;
  position: string;
}) =>
  (before === null || position > before) &&
  (after === null || position < after);
