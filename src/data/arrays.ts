import { PipeType } from '../utils/pipes';
import {
  HelperTextType,
  ItemType,
  JournalEntry,
  Location,
  NPCType,
  PropType,
  QuestType,
  SignType,
  WarpType,
} from './types';

export const itemList: ItemType[] = Object.keys(ItemType)
  .map((key: any) => ItemType[key])
  .filter((k) => typeof k === 'number');

export const journalList: JournalEntry[] = Object.keys(JournalEntry)
  .map((key: any) => JournalEntry[key])
  .filter((k) => typeof k === 'number');

export const npcList: NPCType[] = Object.keys(NPCType)
  .map((key: any) => NPCType[key])
  .filter((k) => typeof k === 'number');

export const propList: PropType[] = Object.keys(PropType)
  .map((key: any) => PropType[key])
  .filter((k) => typeof k === 'number');

export const questList: QuestType[] = Object.keys(QuestType)
  .map((key: any) => QuestType[key])
  .filter((k) => typeof k === 'number');

export const warpList: WarpType[] = Object.keys(WarpType)
  .map((key: any) => WarpType[key])
  .filter((k) => typeof k === 'number');

export const locationListKeys: Location[] = Object.keys(Location) as Location[];
export const locationListValues: Location[] = Object.values(Location) as Location[];

export const helperTextList: HelperTextType[] = Object.keys(HelperTextType)
  .map((key: any) => HelperTextType[key])
  .filter((k) => typeof k === 'number');

export const pipeList: PipeType[] = Object.values(PipeType).filter((value) => typeof value !== 'number');

export const sceneList = [
  'MainMenu',
  'MazeDialog',
  'PipesDialog',
  'TumblerDialog',
  'MemoryDialog',
  'SliderDialog',
  'Books',
];

export const signList: SignType[] = Object.keys(SignType)
  .map((key: any) => SignType[key])
  .filter((k) => typeof k === 'number');
