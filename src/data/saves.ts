import { InventoryData } from '../classes/Player/Inventory';
import { playerStart } from '../classes/Player/Player';
import { isMobile } from '../utils/util';
import { ItemType, JournalEntry, Quest, QuestType } from './types';

export const saveKey = 'chrono-sleuth-save';

// TODO: Add settings
export type Settings = {
  gamepad: boolean;
  debug: boolean;
  zoomed: boolean;
};

export type SaveData = {
  player: {
    x: number;
    y: number;
    flip: boolean;
  };
  journal: JournalEntry[];
  inventory: InventoryData[];
  quests: Quest[];
  settings: Settings;
};

export enum SaveType {
  New,
  Act1,
  Act2,
  LabItems,
}

const debugSettings: Settings = {
  gamepad: false,
  debug: false,
  zoomed: true,
};

const defaultSave: SaveData = {
  player: {
    x: playerStart.x,
    y: playerStart.y,
    flip: false,
  },
  journal: [],
  inventory: [],
  quests: [],
  settings: {
    gamepad: isMobile(),
    debug: false,
    zoomed: true,
  },
};

const act1: SaveData = {
  player: {
    x: playerStart.x,
    y: playerStart.y,
    flip: false,
  },
  journal: [JournalEntry.FixTheClock, JournalEntry.ForestMazeSolved, JournalEntry.SphinxRiddleSolved],
  inventory: [
    { type: ItemType.Wrench, used: false },
    { type: ItemType.Gear1, used: false },
  ],
  quests: [
    { id: QuestType.ForestGear, completed: false },
    { id: QuestType.SphinxRiddle, completed: true },
  ],
  settings: { ...debugSettings },
};

const act2: SaveData = {
  player: {
    x: -770,
    y: playerStart.y,
    flip: true,
  },
  journal: [
    JournalEntry.FixTheClock,
    JournalEntry.ForestMazeSolved,
    JournalEntry.SphinxRiddleSolved,
    JournalEntry.MetTheMayor,
    JournalEntry.ClockFirstGear,
  ],
  inventory: [
    { type: ItemType.Wrench, used: false },
    { type: ItemType.Gear1, used: true },
  ],
  quests: [
    { id: QuestType.ForestGear, completed: true },
    { id: QuestType.SphinxRiddle, completed: true },
    { id: QuestType.InvestigateTownWest, completed: false },
  ],
  settings: { ...debugSettings },
};

const labItems: SaveData = {
  player: {
    x: -150,
    y: 1729,
    flip: true,
  },
  journal: [
    JournalEntry.FixTheClock,
    JournalEntry.ForestMazeSolved,
    JournalEntry.SphinxRiddleSolved,
    JournalEntry.MetTheMayor,
    JournalEntry.ClockFirstGear,
    JournalEntry.AlchemyLabFound,
    JournalEntry.AlchemySetFixed,
  ],
  inventory: [
    { type: ItemType.Wrench, used: false },
    { type: ItemType.Gear1, used: true },
    { type: ItemType.Key, used: true },
  ],
  quests: [
    { id: QuestType.ForestGear, completed: true },
    { id: QuestType.SphinxRiddle, completed: true },
    { id: QuestType.InvestigateTownWest, completed: false },
    { id: QuestType.ExploreLab, completed: false },
    { id: QuestType.FindPotionIngredients, completed: false },
  ],
  settings: { ...debugSettings },
};

export const saves: Record<SaveType, SaveData> = {
  [SaveType.New]: defaultSave,
  [SaveType.Act1]: act1,
  [SaveType.Act2]: act2,
  [SaveType.LabItems]: labItems,
};
