import { JournalEntry } from '../classes/types';

export const JournalData: Record<JournalEntry, string> = {
  [JournalEntry.FixTheClock]:
    'The inventor gave me a wrench to help fix the clock tower. I will also need three gears to repair it.',
  [JournalEntry.ForestMazeSolved]: 'I finally got through the forest maze. Next time should be much easier.',
  [JournalEntry.SphinxRiddleSolved]: 'I solved the sphinx’s riddle. Now I can pass through the forest.',
  [JournalEntry.MetTheMayor]:
    'The inventor suggested I meet the mayor. Once I talked to her, I learned more about the clock tower. I should see if I can use the gear I found to try and fix it.',
};
