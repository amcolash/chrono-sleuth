import { Player } from '../classes/Player';
import { ItemType, NPCType, Quest, QuestType, JournalEntry } from '../classes/types';

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
      messages: ['You found my book! Thank you!', 'I heard that the stranger has something for you.'],
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
      messages: ['My name is Johan and I am an inventor.', 'I wonder what I did with that book of mine...', 'Could you find it for me?'],
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
        completedQuest: QuestType.StrangerRing,
      },
    },
    {
      messages: ['You found my ring! Thank you!', 'I heard a rumor about the mayor making shady deals...'],
      conditions: {
        activeQuest: QuestType.StrangerRing,
        hasItem: ItemType.Ring,
      },
      onCompleted: (player) => {
        player.quests.updateExistingQuest(QuestType.StrangerRing, true);
        player.inventory.removeItem(ItemType.Ring);
      },
    },
    {
      messages: ['Did you find my ring?'],
      conditions: {
        activeQuest: QuestType.StrangerRing,
      },
    },
    {
      messages: ['You helped the inventor?', 'Can you find my ring for me?'],
      conditions: {
        journalEntry: JournalEntry.InventorBookFound,
      },
      onCompleted: (player) => {
        player.quests.addQuest({ id: QuestType.StrangerRing, name: 'Find the strangers ring', completed: false });
      },
    },
    {
      messages: ['Who am I?', 'Eventually, you will learn.'],
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
    if (conditions?.completedQuest !== undefined) results.push(hasCompletedQuest(player.quests.quests, conditions.completedQuest));
    if (conditions?.activeQuest !== undefined) results.push(hasActiveQuest(player.quests.quests, conditions.activeQuest));
    if (conditions?.journalEntry !== undefined) results.push(hasJournalEntry(player.journal.journal, conditions.journalEntry));
    if (conditions?.noJournalEntry !== undefined) results.push(!hasJournalEntry(player.journal.journal, conditions.noJournalEntry));

    if (conditions?.or) {
      if (results.some((result) => result)) return dialog;
    } else if (results.every((result) => result)) return dialog;
  }

  return undefined;
}
