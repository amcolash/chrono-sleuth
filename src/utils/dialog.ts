import { NPC } from '../classes/NPC';
import { Player } from '../classes/Player';
import { ItemType, JournalEntry, NPCType, Quest, QuestType, WarpType } from '../classes/types';
import { updateWarpVisibility } from './interactionUtils';
import { getSphinxAnswer, getSphinxHint, getSphinxOptions, getSphinxRiddle } from './riddles';

export interface NPCDialog {
  conditions?: {
    hasItem?: ItemType;
    completedQuest?: QuestType;
    activeQuest?: QuestType;
    journalEntry?: JournalEntry;
    or?: boolean;
    invert?: boolean;
  };

  messages: string[] | ((player: Player) => string[]);
  onCompleted?: (player: Player, npc?: NPC) => void;

  options?: string[] | ((player: Player) => string[]);
  onSelected?: (option: string, player: Player, npc?: NPC) => void;
}

const npcDialogs: Record<NPCType, NPCDialog[]> = {
  [NPCType.Inventor]: [
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
        'The clock tower is the heart of our town, but it’s been broken for ages. I’ve got a wrench, but',
        'you’ll need three special gears to fix it. You might find the others by helping the townsfolk.',
      ],
      onCompleted: (player) => {
        player.journal.addEntry(JournalEntry.FixTheClock);
        player.inventory.addItem(ItemType.Wrench);
      },
    },
  ],
  [NPCType.Stranger]: [
    {
      messages: (player) => getSphinxHint(player.scene, NPCType.Stranger),
      conditions: {
        activeQuest: QuestType.SphinxRiddle,
      },
    },
    {
      messages: [
        'I’ve heard rumors of a gear hidden deep in the Enchanted Forest. Beware of the forest’s',
        'creatures and traps. I sometimes get lost myself.',
      ],
      conditions: {
        hasItem: ItemType.Wrench,
      },
      onCompleted: (player) => {
        player.quests.addQuest({
          name: 'Find the gear in the forest',
          id: QuestType.ForestGear,
          completed: false,
        });
        updateWarpVisibility(player.scene, WarpType.TownEast, true);
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
      onSelected: (option, player) => {
        const answer = getSphinxAnswer(player.scene);
        if (option === answer) {
          player.quests.updateExistingQuest(QuestType.SphinxRiddle, true);
          player.journal.addEntry(JournalEntry.SphinxRiddleSolved);
        }
      },
    },
    {
      messages: [
        'Welcome, brave soul. To pass, you must answer my riddle correctly. You may only answer once. Choose wisely."',
      ],
      onCompleted: (player) => {
        player.quests.addQuest({ name: 'Solve the sphinx riddle', id: QuestType.SphinxRiddle, completed: false });
      },
    },
  ],
  [NPCType.Mayor]: [
    {
      messages: ['Hello, traveler. I am the mayor of this town.', 'The clock tower has been broken for years.'],
    },
  ],

  // TODO: Should the clock tower be a different type than NPC?
  [NPCType.ClockTower]: [
    {
      messages: [
        "This dusty clock tower hasn't told the correct time in many years.",
        'It appears to be missing some gears.',
      ],
    },
  ],
};

function hasItem(inventory: ItemType[], item: ItemType): boolean {
  return inventory.includes(item);
}

function hasActiveQuest(quests: Quest[], questId: QuestType): boolean {
  return quests.some((quest) => quest.id === questId && !quest.completed);
}

function hasCompletedQuest(quests: Quest[], questId: QuestType): boolean {
  return quests.some((quest) => quest.id === questId && quest.completed);
}

function hasJournalEntry(journal: JournalEntry[], entry: JournalEntry): boolean {
  return journal.includes(entry);
}

export function getDialog(npc: NPCType, player: Player): NPCDialog | undefined {
  const dialogs = npcDialogs[npc] || [];
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
        if (results.every((result) => !result)) return dialog;
      } else if (results.every((result) => !result)) return dialog;
    }

    if (conditions?.or) {
      if (results.some((result) => result)) return dialog;
    } else if (results.every((result) => result)) return dialog;
  }

  return undefined;
}
