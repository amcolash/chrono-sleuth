import { ItemType } from './types';

type Data = {
  x: number;
  y: number;
  image: string;
  name: string;
};

export const ItemData: Record<ItemType, Data> = {
  [ItemType.Wrench]: { x: 150, y: 650, image: 'wrench', name: 'Wrench' },
  [ItemType.Gear1]: { x: 5120, y: 915, image: 'gear', name: 'Gear' },
  [ItemType.Key]: { x: -1575, y: 630, image: 'key', name: 'Key' },
};
