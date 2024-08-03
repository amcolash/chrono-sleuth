import { QuestType } from './types';

export const QuestNames: Record<QuestType, string> = {
  [QuestType.ForestGear]: 'Find the gear in the forest',
  [QuestType.SphinxRiddle]: 'Solve the Sphinx riddle',
  [QuestType.ExploreLab]: 'Explore the hidden alchemy lab',
};
