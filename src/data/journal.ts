import { JournalEntry } from './types';

export const JournalData: Record<JournalEntry, string> = {
  [JournalEntry.FixTheClock]:
    'The inventor gave me a wrench to help fix the clock tower. I will also need three gears to repair it.',
  [JournalEntry.ForestMazeSolved]: 'I finally got through the forest maze. Next time should be much easier.',
  [JournalEntry.SphinxRiddleSolved]: 'I solved the sphinx’s riddle. Now I can pass through the forest.',
  [JournalEntry.MetTheMayor]:
    'I have met the mayor of the town. She told me about the old clock tower. I should see if I can use the gear I found to try and fix it.',
  [JournalEntry.ClockFirstGear]:
    'I found the first gear for the clock tower and placed it into the clock face. I still need two more gears to fix it.',
};
