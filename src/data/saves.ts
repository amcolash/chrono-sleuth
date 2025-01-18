import { GameData, defaultState } from '../classes/Player/GameState';
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
  useShader: boolean;
  time: number;
  muted: boolean;
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
  gameState: GameData;
  settings: Settings;
};

export enum SaveType {
  New,
  Act1,
  Act2,
  LabItems,
  Act3,
}

const defaultSave: SaveData = {
  player: {
    x: playerStart.x,
    y: playerStart.y,
    flip: false,
  },
  journal: [],
  inventory: [],
  quests: [],
  gameState: { ...defaultState },
  settings: {
    gamepad: isMobile(),
    debug: false,
    zoomed: true,
    useShader: true,
    time: Date.now(),
    // muted: !Config.prod,
    muted: false,
  },
};

const debugSettings: Settings = {
  ...defaultSave.settings,
  gamepad: false,
};

const act1: SaveData = {
  player: {
    x: playerStart.x,
    y: playerStart.y,
    flip: false,
  },
  journal: [JournalEntry.FixTheClock],
  inventory: [
    { type: ItemType.Wrench, used: false },
    { type: ItemType.Gear1, used: false },
  ],
  quests: [
    { id: QuestType.ForestGear, completed: false },
    { id: QuestType.SphinxRiddle, completed: true },
  ],
  gameState: { ...defaultState, mazeSolved: true, sphinxMoved: true },
  settings: { ...debugSettings },
};

const act2: SaveData = {
  player: {
    x: -770,
    y: playerStart.y,
    flip: true,
  },
  journal: [JournalEntry.FixTheClock, JournalEntry.MetTheMayor, JournalEntry.ClockFirstGear],
  inventory: [
    { type: ItemType.Wrench, used: false },
    { type: ItemType.Gear1, used: true },
  ],
  quests: [
    { id: QuestType.ForestGear, completed: true },
    { id: QuestType.SphinxRiddle, completed: true },
    { id: QuestType.InvestigateTownWest, completed: false },
  ],
  gameState: { ...defaultState, mazeSolved: true, sphinxMoved: true },
  settings: { ...debugSettings },
};

const labItems: SaveData = {
  player: {
    x: -1500,
    y: 1729,
    flip: true,
  },
  journal: [
    JournalEntry.FixTheClock,
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
  gameState: { ...defaultState },
  settings: { ...debugSettings },
};

const act3: SaveData = {
  player: {
    x: 5073.875,
    y: 915,
    flip: false,
  },
  journal: [
    JournalEntry.FixTheClock,
    JournalEntry.MetTheMayor,
    JournalEntry.ClockFirstGear,
    JournalEntry.AlchemyLabFound,
    JournalEntry.AlchemySetFixed,
    JournalEntry.SafeDiscovered,
    JournalEntry.ExtraPotionInformation,
    JournalEntry.ClockSecondGear,
  ],
  inventory: [
    {
      type: ItemType.Wrench,
      used: false,
    },
    {
      type: ItemType.Gear1,
      used: true,
    },
    {
      type: ItemType.Key,
      used: true,
    },
    {
      type: ItemType.HerbRed,
      used: true,
    },
    {
      type: ItemType.HerbGreen,
      used: true,
    },
    {
      type: ItemType.HerbBlue,
      used: true,
    },
    {
      type: ItemType.Potion,
      used: true,
    },
    {
      type: ItemType.Gear2,
      used: true,
    },
  ],
  quests: [
    {
      id: QuestType.ForestGear,
      completed: true,
    },
    {
      id: QuestType.SphinxRiddle,
      completed: true,
    },
    {
      id: QuestType.InvestigateTownWest,
      completed: true,
    },
    {
      id: QuestType.ExploreLab,
      completed: true,
    },
    {
      id: QuestType.FindPotionIngredients,
      completed: true,
    },
  ],
  gameState: { ...defaultState, mazeSolved: true, sphinxMoved: true },
  settings: { ...debugSettings },
};

export const saves: Record<SaveType, SaveData> = {
  [SaveType.New]: defaultSave,
  [SaveType.Act1]: act1,
  [SaveType.Act2]: act2,
  [SaveType.LabItems]: labItems,
  [SaveType.Act3]: act3,
};
