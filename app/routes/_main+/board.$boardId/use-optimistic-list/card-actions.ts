import type {
  ArchiveAllCardInList,
  CreateCard,
  MoveCard,
  MoveCardInThisList,
} from "../schema/card";
import type { Lists } from "../types";

export const archiveAllCardInList = (
  lists: Lists,
  { listId }: ArchiveAllCardInList,
) =>
  lists.map((list) =>
    list.id === listId
      ? {
          ...list,
          cards: list.cards.map((card) => ({ ...card, archived: true })),
        }
      : list,
  );

export const createCard = (lists: Lists, cardData: CreateCard) =>
  lists.map((list) =>
    list.id === cardData.listId
      ? {
          ...list,
          cards: [
            ...list.cards,
            { ...cardData, archived: false, completed: false },
          ],
        }
      : list,
  );

export function moveCard(
  lists: Lists,
  { id, listId, sourceListId, position }: MoveCard,
) {
  const sourceList = lists.find((list) => list.id === sourceListId);
  const card = sourceList?.cards.find((card) => card.id === id);

  if (!card) {
    return lists;
  }

  return lists.map((list) => {
    if (list.id !== listId && list.id !== sourceListId) {
      return list;
    }
    const listWithoutCard = list.cards.filter((card) => card.id !== id);

    return {
      ...list,
      cards:
        list.id === listId
          ? listWithoutCard.concat([{ ...card, listId, position }])
          : listWithoutCard,
    };
  });
}

export const moveCardInThisList = (
  lists: Lists,
  { destinationListId, sourceListId }: MoveCardInThisList,
) =>
  lists.map((list) => {
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
