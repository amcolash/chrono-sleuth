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
}

export enum ItemType {
  Book,
  Map,
}

export enum QuestType {
  InventorBook,
  StrangerMap,
}

export enum NPCType {
  Inventor,
  Stranger,
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
