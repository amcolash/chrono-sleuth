import { Item } from '../classes/Environment/Item';
import { NPC } from '../classes/Environment/NPC';
import { Prop } from '../classes/Environment/Prop';
import { Player } from '../classes/Player/Player';
import { hasActiveQuest, hasCompletedQuest, hasItem, hasJournalEntry } from '../utils/interactionUtils';
import { getSphinxAnswer, getSphinxHint, getSphinxOptions, getSphinxRiddle } from '../utils/riddles';
import { ItemType, JournalEntry, NPCType, PropType, QuestType } from './types';

export interface Dialog<T> {
  conditions?: {
    hasItem?: ItemType;
    completedQuest?: QuestType;
    activeQuest?: QuestType;
    journalEntry?: JournalEntry;
    or?: boolean;
    invert?: boolean;
  };

  messages: string[] | ((player: Player) => string[]);
  options?: string[] | ((player: Player) => string[]);

  onCompleted?: (player: Player, target?: T) => void;
  onSelected?: (option: string, player: Player, target?: T) => void;
}

export const NPCDialogs: Record<NPCType, Dialog<NPC>[]> = {
  [NPCType.Inventor]: [
    {
      messages: ['I see you found the first gear. You should talk to the mayor to learn more about the old clock.'],
      conditions: {
        hasItem: ItemType.Gear1,
      },
      onCompleted: (player) => {
        player.quests.updateExistingQuest(QuestType.ForestGear, true);
      },
    },
    {
      messages: (player) => getSphinxHint(player.scene, NPCType.Inventor),
      conditions: {
        activeQuest: QuestType.SphinxRiddle,
      },
    },
    {
      messages: ['Now that you have the wrench, you can fix the clock tower. You’ll need three gears to do it.'],
      conditions: {
        hasItem: ItemType.Wrench,
      },
    },
    {
      messages: [
        'The clock tower is the heart of our town, but it’s been broken for ages. I’ve got a wrench, but you’ll need three special gears to fix it.',
        'You might find the others by helping the townsfolk.',
      ],
      onCompleted: (player) => {
        player.journal.addEntry(JournalEntry.FixTheClock);
        player.inventory.addItem(ItemType.Wrench);
      },
    },
  ],
  [NPCType.Stranger]: [
    {
      messages: ['Now that you have the first gear, I would talk to the inventor.'],
      conditions: {
        hasItem: ItemType.Gear1,
      },
    },
    {
      messages: (player) => getSphinxHint(player.scene, NPCType.Stranger),
      conditions: {
        activeQuest: QuestType.SphinxRiddle,
      },
    },
    {
      messages: [
        'I’ve heard rumors of a gear hidden deep in the Enchanted Forest. Beware of the forest’s creatures and traps.',
        'One time I thought I saw an ancient being, but it ran away.',
      ],
      conditions: {
        hasItem: ItemType.Wrench,
      },
      onCompleted: (player) => {
        player.quests.addQuest({
          id: QuestType.ForestGear,
          completed: false,
        });
      },
    },
    {
      messages: ['Who am I?', 'Eventually, you will learn.'],
    },
  ],
  [NPCType.Sphinx]: [
    {
      messages: (player) => getSphinxRiddle(player.scene),
      options: (player) => getSphinxOptions(player.scene),
      conditions: {
        activeQuest: QuestType.SphinxRiddle,
      },
      onSelected: (option, player, npc) => {
        const answer = getSphinxAnswer(player.scene);
        if (option === answer) {
          player.message.setDialog<NPC>(
            {
              messages: [`That is correct. Well done, you may pass.`],
              onCompleted: (player) => {
                player.quests.updateExistingQuest(QuestType.SphinxRiddle, true);
                player.journal.addEntry(JournalEntry.SphinxRiddleSolved);
              },
            },
            npc
          );
        } else if (option === 'I don’t know') {
          player.message.setDialog<NPC>({ messages: ['Come back when you have an answer for me.'] }, npc);
        } else {
          // TODO: Add back talking points so we can hide dialog in a different system that is reset
          player.message.setDialog<NPC>({ messages: ['That is not correct. Do not return.'] }, npc);
        }
      },
    },
    {
      messages: [
        'Welcome, brave soul. To pass, you must answer my riddle. You may only answer once. If you are unsure, you may speak to the townsfolk. Choose wisely.',
      ],
      onCompleted: (player) => {
        player.quests.addQuest({ id: QuestType.SphinxRiddle, completed: false });
      },
    },
  ],
  [NPCType.Mayor]: [
    {
      messages: [
        'The minute hand on the clock is spinning again.',
        'It looks like it’s missing two more gears.',
        'The abandoned mansion west of the town might be a good place to look.',
      ],
      conditions: {
        journalEntry: JournalEntry.ClockFirstGear,
      },
    },
    {
      messages: ['Did you go into the clock tower yet?'],
      conditions: {
        journalEntry: JournalEntry.MetTheMayor,
      },
    },
    {
      messages: [
        'Hello, traveler. I am the mayor of this town. The clock tower has been broken for years.',
        'Ah, I see you have found an old gear. Maybe it could be used to help fix the clock tower.',
      ],
      onCompleted: (player) => {
        player.journal.addEntry(JournalEntry.MetTheMayor);
      },
    },
  ],

  // TODO: Should the clock tower be a different type than NPC?
  [NPCType.ClockTower]: [
    {
      messages: ['The clock is partially moving again, but it is still missing two gears.'],
      conditions: {
        journalEntry: JournalEntry.ClockFirstGear,
      },
    },
    {
      messages: [
        "This dusty clock tower hasn't told the correct time in many years. It appears to be missing some gears.",
        'Let’s see what happens when we add the first gear.',
        '[CREAKING NOISE]',
        'The clock tower is starting to partially move again. It looks like it’s missing two more gears.',
      ],
      conditions: {
        hasItem: ItemType.Gear1,
      },
      onCompleted: (player) => {
        player.inventory.removeItem(ItemType.Gear1);
        player.journal.addEntry(JournalEntry.ClockFirstGear);
      },
    },
  ],
};

export const ItemDialogs: { [key in ItemType]?: Dialog<Item>[] } = {
  [ItemType.Gear1]: [
    {
      messages: ['Hmm, this gear looks like it belongs in the clock tower. I should ask the inventor about it.'],
    },
  ],
};

export const PropDialogs: { [key in ItemType]?: Dialog<Prop>[] } = {
  [PropType.LabHatch]: [
    {
      messages: ['Let me see if I can open this hatch.'],
      conditions: {
        hasItem: ItemType.Key,
      },
      onCompleted: (player, prop) => {
        prop?.destroy();
        console.log(prop);
        player.inventory.removeItem(ItemType.Key);
        player.journal.addEntry(JournalEntry.AlchemyLabFound);
      },
    },

    {
      messages: ['The hatch is locked. I wonder if there is a key somewhere.'],
    },
  ],
  [PropType.LabBook]: [
    {
      messages: [
        'This book contains notes about an ancient alchemy experiement.',
        'According to the notes, the experiment was a failure, and the alchemist disappeared.',
        'It does say that there might have been a problem with one of the ingredients.',
        'Maybe I can find more information in the lab.',
      ],
      onCompleted: (player) => {
        player.quests.addQuest({ id: QuestType.ExploreLab, completed: false });
      },
    },
  ],
};

export function getDialog<T>(dialogs: Dialog<T>[], player: Player): Dialog<T> | undefined {
  for (const dialog of dialogs) {
    const { conditions } = dialog;

    const results = [];

    if (conditions?.hasItem !== undefined) results.push(hasItem(player.inventory.inventory, conditions.hasItem));
    if (conditions?.completedQuest !== undefined)
      results.push(hasCompletedQuest(player.quests.quests, conditions.completedQuest));
    if (conditions?.activeQuest !== undefined)
      results.push(hasActiveQuest(player.quests.quests, conditions.activeQuest));
    if (conditions?.journalEntry !== undefined)
      results.push(hasJournalEntry(player.journal.journal, conditions.journalEntry));

    if (conditions?.invert) {
      if (conditions?.or) {
        if (results.some((result) => !result)) return dialog;
      } else if (results.every((result) => !result)) return dialog;

      return undefined;
    }

    if (conditions?.or) {
      if (results.some((result) => result)) return dialog;
    } else if (results.every((result) => result)) return dialog;
  }

  return undefined;
}
