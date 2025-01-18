import { Item } from '../classes/Environment/Item';
import { DataProps, ItemType } from './types';

type Data = DataProps<Item> & {
  image: string;
  name: string;
};

export const ItemData: Record<ItemType, Data> = {
  [ItemType.Wrench]: { x: 0, y: 0, image: 'wrench', name: 'Old Wrench' },
  [ItemType.Gear1]: { x: 0, y: 0, image: 'gear', name: 'Shiny Gear' },
  [ItemType.Key]: { x: 0, y: 0, image: 'key', name: 'Rusty Key', skipLighting: true },
  [ItemType.HerbRed]: { x: -200, y: 1730, image: 'herb_red', name: 'Crimson Starbloom' },
  [ItemType.HerbGreen]: { x: 5295, y: 985, image: 'herb_green', name: 'Green Writhewood' },
  [ItemType.HerbBlue]: { x: 1535, y: 875, image: 'herb_blue', name: 'Blue Plumed Frond' },
  [ItemType.Potion]: { x: 0, y: 0, image: 'potion', name: 'Strange Potion' },
  [ItemType.Gear2]: { x: 0, y: 0, image: 'gear2', name: 'Old Gear' },
};
