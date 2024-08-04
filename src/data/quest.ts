import { QuestType, WarpType } from './types';

interface Data {
  description: string;
  warpAdd?: WarpType;
  warpComplete?: WarpType;
}

export const QuestData: Record<QuestType, Data> = {
  [QuestType.ForestGear]: {
    description: 'Find the gear in the forest',
    warpAdd: WarpType.TownEast,
    warpComplete: WarpType.TownNorth,
  },
  [QuestType.SphinxRiddle]: { description: 'Solve the Sphinx riddle' },
  [QuestType.ExploreLab]: { description: 'Explore the hidden alchemy lab' },
};
