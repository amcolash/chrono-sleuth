import { Key } from './InputManager';

export enum InteractResult {
  None,
  Teleported,
  Talked,
  Item,
}

export interface Interactive {
  interactionTimeout?: number;
  getButtonPrompt?(): string | string[];

  onInteract(keys: Record<Key, boolean>): InteractResult;
}

export interface Rewindable {
  history: Phaser.Math.Vector3[];
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

  TownNorth,
  ClockSquare,

  ClockSquareNorth,
  ClockEntrance,

  ClockStairs,
  ClockTop,
}

export enum ItemType {
  Wrench,
  Gear1,
}

export enum QuestType {
  ForestGear,
  SphinxRiddle,
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
