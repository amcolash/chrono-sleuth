import { Math } from 'phaser';

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
  getButtonPrompt?(): string | string[];

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

export enum WarpType {
  Underground,
  Town,

  TownEast,
  Forest,

  ForestEast,
  Lake,

  LakeEast,

  TownNorth,
  ClockSquare,

  ClockSquareNorth,
  ClockEntrance,

  ClockStairs,
  ClockTop,

  TownWest,
  MansionOutside,

  MansionEntrance,
  MansionExit,

  LabEntrance,
  LabExit,
}

export enum ItemType {
  Wrench,
  Gear1,
}

export enum QuestType {
  ForestGear,
  SphinxRiddle,
  ExploreLab,
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
  ForestMazeSolved,
  SphinxRiddleSolved,
  MetTheMayor,
  ClockFirstGear,
}

export enum PropType {
  LabBook,
  AlchemySet,
}
