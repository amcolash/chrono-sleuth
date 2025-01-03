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
    warpAdd: WarpType.LabHatch,
  },
  [JournalEntry.AlchemySetFixed]: {
    description: 'With the alchemy set fixed, I can now attempt to create the brew mentioned in the old journal.',
  },
  [JournalEntry.ExtraPotionInformation]: {
    description:
      'I found an extra journal entry with more information on the potion. It stated the name of the potion was the "Exlixir of Sight". This potion must be the key to finding a gear.',
  },
  [JournalEntry.SafeDiscovered]: {
    description: 'I discovered a safe in the abandonded mansion. I wonder what secrets it holds.',
  },
  [JournalEntry.ClockSecondGear]: {
    description:
      'I found the second gear for the clock tower inside a safe, which was located within the abandoned mansion. I still need one more gear to fix it.',
  },
};
