import { JournalEntry, WarpType } from './types';

interface Data {
  description: string;
  warpAdd?: WarpType;
}

export const JournalData: Record<JournalEntry, Data> = {
  [JournalEntry.FixTheClock]: {
    description:
      'The inventor gave me a wrench to help fix the clock tower. I will also need three gears to repair it.',
  },
  [JournalEntry.ForestMazeSolved]: {
    description: 'I finally got through the forest maze. Next time should be much easier.',
  },
  [JournalEntry.SphinxRiddleSolved]: {
    description: 'I solved the sphinx’s riddle. Now I can pass through the forest.',
    warpAdd: WarpType.ForestEast,
  },
  [JournalEntry.MetTheMayor]: {
    description:
      'I have met the mayor of the town. She told me about the old clock tower. I should see if I can use the gear I found to try and fix it.',
    warpAdd: WarpType.ClockSquareNorth,
  },
  [JournalEntry.ClockFirstGear]: {
    description:
      'I found the first gear for the clock tower and placed it into the clock face. I still need two more gears to fix it.',
  },
};
