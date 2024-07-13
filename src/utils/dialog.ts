import { Player } from '../classes/Player';
import { ItemType, JournalEntry, NPCType, Quest, QuestType } from '../classes/types';

export interface NPCDialog {
  conditions?: {
    hasItem?: ItemType;
    completedQuest?: QuestType;
    activeQuest?: QuestType;
    journalEntry?: JournalEntry;
    noJournalEntry?: JournalEntry;
    or?: boolean;
  };
  messages: string[];
  onCompleted?: (player: Player) => void;
}

const npcDialogs: Record<NPCType, NPCDialog[]> = {
  [NPCType.Inventor]: [
    {
      messages: ['I am working on a new invention.'],
      conditions: {
        completedQuest: QuestType.InventorBook,
        journalEntry: JournalEntry.InventorBookFound,
      },
    },
    {
      messages: ['You found my book! Thank you!', 'I heard that the stranger might need some help.'],
      conditions: {
        activeQuest: QuestType.InventorBook,
        hasItem: ItemType.Book,
      },
      onCompleted: (player) => {
        player.quests.updateExistingQuest(QuestType.InventorBook, true);
        player.inventory.removeItem(ItemType.Book);
        player.journal.addEntry(JournalEntry.InventorBookFound);
      },
    },
    {
      messages: ['Did you find my book yet?'],
      conditions: {
        activeQuest: QuestType.InventorBook,
      },
    },
    {
      messages: [
        'My name is Johan and I am an inventor.',
        'I wonder what I did with that book of mine...',
        'Could you find it for me?',
      ],
      conditions: {
        noJournalEntry: JournalEntry.InventorBookFound,
      },
      onCompleted: (player) => {
        player.quests.addQuest({ id: QuestType.InventorBook, name: 'Find the inventors book', completed: false });
      },
    },
    {
      messages: ['My name is Johan and I am an inventor.'],
    },
  ],
  [NPCType.Stranger]: [
    {
      messages: ['I saw her this morning in the forest.'],
      conditions: {
        completedQuest: QuestType.StrangerMap,
      },
    },
    {
      messages: ['You found my map! Thank you!', 'I heard a rumor about the mayor making shady deals in the forest...'],
      conditions: {
        activeQuest: QuestType.StrangerMap,
        hasItem: ItemType.Map,
      },
      onCompleted: (player) => {
        player.quests.updateExistingQuest(QuestType.StrangerMap, true);
        player.inventory.removeItem(ItemType.Map);
        player.journal.addEntry(JournalEntry.StrangerMapFound);
      },
    },
    {
      messages: ['Did you find my map?'],
      conditions: {
        activeQuest: QuestType.StrangerMap,
      },
    },
    {
      messages: ['You helped the inventor?', 'Can you find my map for me?'],
      conditions: {
        journalEntry: JournalEntry.InventorBookFound,
      },
      onCompleted: (player) => {
        player.quests.addQuest({ id: QuestType.StrangerMap, name: 'Find the strangers map', completed: false });
      },
    },
    {
      messages: ['Who am I?', 'Eventually, you will learn.'],
    },
  ],
  // TODO: Should the clock tower be a different type than NPC?
  [NPCType.ClockTower]: [
    {
      messages: ["This dusty clock tower hasn't worked in many years."],
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
    if (conditions?.noJournalEntry !== undefined)
      results.push(!hasJournalEntry(player.journal.journal, conditions.noJournalEntry));

    if (conditions?.or) {
      if (results.some((result) => result)) return dialog;
    } else if (results.every((result) => result)) return dialog;
  }

  return undefined;
}
