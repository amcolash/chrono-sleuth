import { ItemType } from './types';

type Data = {
  x: number;
  y: number;
  image: string;
  name: string;
};

export const ItemData: Record<ItemType, Data> = {
  [ItemType.Wrench]: { x: 0, y: 0, image: 'wrench', name: 'Old Wrench' },
  [ItemType.Gear1]: { x: 5120, y: 915, image: 'gear', name: 'Shiny Gear' },
  [ItemType.Key]: { x: -1430, y: -470, image: 'key', name: 'Rusty Key' },
  [ItemType.HerbRed]: { x: -200, y: 1730, image: 'herb_red', name: 'Blue Plumed Frond' },
  [ItemType.HerbGreen]: { x: -260, y: 1730, image: 'herb_green', name: 'Green Writhewood' },
  [ItemType.HerbBlue]: { x: -320, y: 1730, image: 'herb_blue', name: 'Crimson Starbloom' },
  [ItemType.Potion]: { x: 0, y: 0, image: 'potion', name: 'Strange Potion' },
};
