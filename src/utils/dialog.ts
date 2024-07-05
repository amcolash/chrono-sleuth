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
        completedQuest: QuestType.INVENTOR_BOOK,
      },
    },
    {
      messages: ['You found my book! Thank you!', 'I heard that the stranger has something for you.'],
      conditions: {
        activeQuest: QuestType.INVENTOR_BOOK,
        hasItem: ItemType.Book,
      },
      onCompleted: (player) => {
        player.updateQuest(QuestType.INVENTOR_BOOK, true);
        player.removeItem(ItemType.Book);
      },
    },
    {
      messages: ['Did you find my book yet?'],
      conditions: {
        activeQuest: QuestType.INVENTOR_BOOK,
      },
    },
    {
      messages: ['I wonder what I did with that book of mine...', 'Could you find it for me?'],
      conditions: {
        talkingPoint: TalkingPoint.INVENTOR_GREETED,
      },
      onCompleted: (player) => {
        player.addQuest({ id: QuestType.INVENTOR_BOOK, name: 'Find the inventors book', completed: false });
      },
    },
    {
      messages: ['Are you new around Here?', 'My name is Johan and I am an inventor.'],
      onCompleted: (player) => {
        player.talkingPoints.push(TalkingPoint.INVENTOR_GREETED);
      },
    },
  ],
  [NPCType.Stranger]: [
    {
      messages: ['Did you find my ring?'],
      conditions: {
        activeQuest: QuestType.STRANGER_RING,
      },
    },
    {
      messages: ['I heard you met the inventor.', 'Can you find my ring for me?'],
      conditions: {
        completedQuest: QuestType.INVENTOR_BOOK,
      },
      onCompleted: (player) => {
        player.addQuest({ id: QuestType.STRANGER_RING, name: 'Find the strangers ring', completed: false });
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

    if (conditions?.hasItem !== undefined && !hasItem(player.inventory, conditions.hasItem)) continue;
    if (conditions?.completedQuest !== undefined && !hasCompletedQuest(player.quests, conditions.completedQuest)) continue;
    if (conditions?.activeQuest !== undefined && !hasActiveQuest(player.quests, conditions.activeQuest)) continue;
    if (conditions?.talkingPoint !== undefined && !hasTalkingPoint(player.talkingPoints, conditions.talkingPoint)) continue;

    return dialog;
  }

  return undefined;
}
