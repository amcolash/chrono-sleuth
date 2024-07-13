export enum InteractResult {
  None,
  Teleported,
  Talked,
  Item,
}

export interface Interactive {
  interactionTimeout?: number;
  getButtonPrompt?(): string | string[];

  onInteract(keys: { [key: string]: Phaser.Input.Keyboard.Key } | undefined): InteractResult;
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

  TownNorth,
  ClockSquare,

  ClockSquareNorth,
  ClockEntrance,

  ClockStairs,
  ClockTop,
}

export enum ItemType {
  Wrench,
  Gear,
}

export enum QuestType {
  ClockGear1,
  ClockGear2,
  ClockGear3,
}

export enum NPCType {
  // Characters
  Inventor,
  Stranger,
  Sphinx,

  // Inanimate objects
  ClockTower,
}

export interface Quest {
  id: QuestType;
  name: string;
  completed: boolean;
}

export enum JournalEntry {
  // Inventor
  InventorBookFound,

  // Stranger
  StrangerMapFound,
}
