import { NPC } from '../classes/NPC';
import { Player } from '../classes/Player';
import { ItemType, JournalEntry, NPCType, Quest, QuestType } from '../classes/types';
import { updateSphinx } from './npcUtils';

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
  onCompleted?: (player: Player, npc?: NPC) => void;
}

const npcDialogs: Record<NPCType, NPCDialog[]> = {
  [NPCType.Inventor]: [
    {
      messages: ['My name is Johan and I am an inventor.', 'This is a weird place.'],
    },
  ],
  [NPCType.Stranger]: [
    {
      messages: ['Who am I?', 'Eventually, you will learn.'],
    },
  ],
  [NPCType.Sphinx]: [
    {
      messages: [
        'I am the sphinx of this forest. Answer my riddle and you may pass.',
        'What has a head, a tail, is brown, and has no legs?',
      ],
      onCompleted: (_player, npc) => {
        if (npc) updateSphinx(npc, true);
      },
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
    if (conditions?.noJournalEntry !== undefined)
      results.push(!hasJournalEntry(player.journal.journal, conditions.noJournalEntry));

    if (conditions?.or) {
      if (results.some((result) => result)) return dialog;
    } else if (results.every((result) => result)) return dialog;
  }

  return undefined;
}
