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
  [JournalEntry.AlchemyLabFound]: {
    description: 'I found a secret alchemy lab. I wonder what the previous alchemist was brewing up.',
    warpAdd: WarpType.LabEntrance,
  },
  [JournalEntry.AlchemySetFixed]: {
    description: 'With the alchemy set fixed, I can now attempt to create the brew mentioned in the old journal.',
  },
  [JournalEntry.SafeDiscovered]: {
    description: 'I discovered a safe in the abandonded mansion. I wonder what secrets it holds.',
  },
  [JournalEntry.ExtraPotionInformation]: {
    description:
      'I found an extra journal entry with more information on the potion. It stated the name of the potion was the "Keyless Elixir". This potion must be the key to unlocking the safe.',
  },
  [JournalEntry.ClockSecondGear]: {
    description:
      'I found the second gear for the clock tower inside a safe, which was located within the abandoned mansion. I still need one more gear to fix it.',
  },
};
