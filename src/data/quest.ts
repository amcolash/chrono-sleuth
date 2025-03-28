import { QuestType, WarpType } from './types';

interface Data {
  description: string;
  warpAdd?: WarpType;
  warpComplete?: WarpType;
}

export const QuestData: Record<QuestType, Data> = {
  [QuestType.ForestGear]: {
    description: 'Search the forest for clues',
    warpAdd: WarpType.TownEast,
    warpComplete: WarpType.TownNorth,
  },
  [QuestType.SphinxRiddle]: { description: 'Solve the Sphinx riddle' },
  [QuestType.InvestigateTownWest]: { description: 'Investigate the western mansion', warpAdd: WarpType.TownWest },
  [QuestType.ExploreLab]: { description: 'Explore the hidden alchemy lab' },
  [QuestType.FindPotionIngredients]: { description: 'Find the 3 potion ingredients' },
};
