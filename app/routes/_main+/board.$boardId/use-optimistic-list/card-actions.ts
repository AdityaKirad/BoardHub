import { sortPosition } from ".";
import type { Lists } from "../types";

export const createCard = (
  lists: Lists,
  cardData: { id: string; listId: string; title: string; position: string },
) =>
  lists.map((list) =>
    list.id === cardData.listId
      ? {
          ...list,
          cards: [...list.cards, { ...cardData, completed: false }].sort(
            (a, b) => sortPosition(a.position, b.position),
          ),
        }
      : list,
  );

export function moveCard(
  lists: Lists,
  { id, listId, position }: { id: string; listId: string; position: string },
) {
  const card = lists
    .flatMap((list) => list.cards)
    .find((card) => card.id === id);

  if (!card) {
    return lists;
  }

  return lists.map((list) => {
    if (list.id !== listId && list.id !== card?.listId) {
      return list;
    }
    const listWithoutCard = list.cards.filter((card) => card.id !== id);
    const newCards =
      list.id === listId
        ? listWithoutCard.concat([{ ...card, listId, position }])
        : listWithoutCard;
    return {
      ...list,
      cards: newCards.sort((a, b) => a.position.localeCompare(b.position)),
    };
  });
}

export function moveCardInThisList(
  lists: Lists,
  {
    destinationListId,
    sourceListId,
  }: { destinationListId: string; sourceListId: string },
) {
  return lists.map((list) => {
    if (list.id === sourceListId) {
      return {
        ...list,
        cards: [],
      };
    }
    if (list.id === destinationListId) {
      const sourceList = lists.find((list) => list.id === sourceListId);
      if (!sourceList) {
        return list;
      }
      const movedCards = sourceList.cards.map((card) => ({
        ...card,
        listId: destinationListId,
      }));
      return {
        ...list,
        cards: [...list.cards, ...movedCards],
      };
    }
    return list;
  });
}
