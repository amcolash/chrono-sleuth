import { JournalEntry } from '../classes/types';

export const JournalData: Record<JournalEntry, string> = {
  [JournalEntry.FixTheClock]: 'The inventor gave me a wrench to fix the clock tower. I need three gears to repair it.',
  [JournalEntry.ForestMazeSolved]: 'I finally got through the forest maze. Next time should be much easier.',
  [JournalEntry.SphinxRiddleSolved]: 'I solved the sphinx’s riddle. Now I can pass through the forest.',
  [JournalEntry.MeetTheMayor]:
    'The inventor suggested I meet the mayor. She is usually by the old clock or in her office.',
};
