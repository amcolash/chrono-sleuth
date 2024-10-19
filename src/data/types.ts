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
  lazyInit(forceInit?: boolean): void;
}

export type DataProps = {
  x: number;
  y: number;
  image?: string;

  scale?: number | Types.Math.Vector2Like;
  alpha?: number;
  angle?: number;
  depth?: number;
  skipLighting?: boolean;
  particles?: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig;
  origin?: Types.Math.Vector2Like;
  initializeOnStart?: boolean;
};

export enum WarpType {
  Underground,
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

  // Inanimate objects
  ClockTower,
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
}
