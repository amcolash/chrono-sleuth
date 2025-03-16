import { Math, Types } from 'phaser';

import { Key } from '../classes/UI/InputManager';

export enum InteractResult {
  None,
  Teleported,
  Talked,
  Item,
  Prop,
}

export interface Interactive {
  interactionTimeout?: number;
  disabled?: boolean;

  getButtonPrompt?(): string | string[] | undefined;

  onCollided?(): void;
  onInteract(keys: Record<Key, boolean>): InteractResult;
}

export interface Rewindable {
  history: Math.Vector3[];
  rewinding: boolean;

  record(): void;
  rewind(): void;
  setRewind(rewind: boolean): void;
  reset?(): void;
}

export interface LazyInitialize {
  initialized: boolean;
  lazyInit(): void;
}

export interface PostUpdated {
  postUpdate(): void;
}

export type DataProps<T> = {
  x: number;
  y: number;
  image?: string;

  name?: string;

  scale?: number | Types.Math.Vector2Like;
  alpha?: number;
  angle?: number;
  depth?: number;
  skipLighting?: boolean;
  particles?: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig;
  origin?: Types.Math.Vector2Like;
  onCreate?: (obj: T) => void;
};

export enum WarpType {
  Station,
  Town,

  TownEast,
  Forest,

  ForestEast,
  Lake,

  TownNorth,
  ClockSquare,

  ClockSquareNorth,
  ClockEntrance,

  ClockStairs,
  ClockTop,

  TownWest,
  MansionGrounds,

  MansionEntrance,
  Mansion,

  LabHatch,
  Lab,

  LibraryEntrance,
  Library,

  TownHallEntrance,
  TownHall,

  InnEntrance,
  Inn,
}

export enum ItemType {
  Wrench,
  Gear1,
  Key,
  HerbRed,
  HerbGreen,
  HerbBlue,
  Potion,
  Gear2,
  Note,
}

export enum QuestType {
  ForestGear,
  SphinxRiddle,
  InvestigateTownWest,
  ExploreLab,
  FindPotionIngredients,
}

export enum NPCType {
  // Characters
  Inventor,
  Stranger,
  Sphinx,
  Mayor,
  Innkeeper,
  Baker,
}

export enum WallType {
  Sphinx,
}

export interface Quest {
  id: QuestType;
  completed: boolean;
}

export enum JournalEntry {
  FixTheClock,
  MetTheMayor,
  ClockFirstGear,
  AlchemyLabFound,
  AlchemySetFixed,
  ExtraPotionInformation,
  SafeDiscovered,
  ClockSecondGear,
}

export enum PropType {
  ClockTower,
  Chest,
  LabHatch,
  LabBook,
  AlchemySet,
  LabBookshelf1,
  LabBookshelf2,
  LabBookshelf3,
  LabPotionShelf1,
  MansionPicture,
  MansionHole,
  Bed,
  LibraryShelf,
}

export enum HelperTextType {
  LabStairs,
  InnStairs,
}

export enum Location {
  Town = 'Town',
  Station = 'Train Station',
  ClockOutside = 'Clock Tower Square',
  ClockInner = 'Clock Tower',
  Forest = 'Strange Woods',
  Lake = 'Lake Epoch',
  MansionOutside = 'Mansion Grounds',
  MansionInside = 'Mansion',
  AlchemyLab = 'Secret Alchemy Lab',
  Library = 'Library',
  TownHall = 'Town Hall',
  Inn = 'Inn',
}

export enum MusicType {
  Intro = 'music-intro',
  Station = 'music-station',
  Town = 'music-town',
  Mansion = 'music-mansion',
  Forest = 'music-forest',
  Clock = 'music-clock',
}

export enum SignType {
  Library,
  Inn,
  Train,
}
