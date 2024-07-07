import { Player } from '../classes/Player';
import { ItemType, NPCType, Quest, QuestType, TalkingPoint } from '../classes/types.';

export interface NPCDialog {
  conditions?: {
    hasItem?: ItemType;
    completedQuest?: QuestType;
    activeQuest?: QuestType;
    talkingPoint?: TalkingPoint;
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
      },
    },
    {
      messages: ['Did you find my book yet?'],
      conditions: {
        activeQuest: QuestType.InventorBook,
      },
    },
    {
      messages: ['I wonder what I did with that book of mine...', 'Could you find it for me?'],
      conditions: {
        talkingPoint: TalkingPoint.INVENTOR_GREETED,
      },
      onCompleted: (player) => {
        player.quests.addQuest({ id: QuestType.InventorBook, name: 'Find the inventors book', completed: false });
      },
    },
    {
      messages: ['Are you new around here?', 'My name is Johan and I am an inventor.'],
      onCompleted: (player) => {
        player.talkingPoints.push(TalkingPoint.INVENTOR_GREETED);
      },
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
      messages: ['I heard you met the inventor.', 'Can you find my ring for me?'],
      conditions: {
        completedQuest: QuestType.InventorBook,
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

function hasTalkingPoint(talkingPoints: TalkingPoint[], talkingPoint: TalkingPoint): boolean {
  return talkingPoints.includes(talkingPoint);
}

export function getDialog(npc: NPCType, player: Player): NPCDialog | undefined {
  const dialogs = npcDialogs[npc] || [];
  for (const dialog of dialogs) {
    const { conditions } = dialog;

    if (conditions?.hasItem !== undefined && !hasItem(player.inventory.inventory, conditions.hasItem)) continue;
    if (conditions?.completedQuest !== undefined && !hasCompletedQuest(player.quests.quests, conditions.completedQuest)) continue;
    if (conditions?.activeQuest !== undefined && !hasActiveQuest(player.quests.quests, conditions.activeQuest)) continue;
    if (conditions?.talkingPoint !== undefined && !hasTalkingPoint(player.talkingPoints, conditions.talkingPoint)) continue;

    return dialog;
  }

  return undefined;
}
