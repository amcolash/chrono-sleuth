export enum InteractResult {
  None,
  Teleported,
  Talked,
  Item,
}

export interface Interactive {
  interactionTimeout?: number;
  getButtonPrompt?(): string;

  onInteract(keys: { [key: string]: Phaser.Input.Keyboard.Key } | undefined): InteractResult;
}

export interface Rewindable {
  history: Phaser.Math.Vector3[];
  rewinding: boolean;

  record(): void;
  rewind(): void;
  setRewind(rewind: boolean): void;
}

export enum WarpType {
  STAIRS_TOP,
  STAIRS_BOTTOM,
  TOWN_EAST,
  FOREST,
}

export enum ItemType {
  Book,
  Ring,
}

export enum QuestType {
  INVENTOR_BOOK,
  STRANGER_RING,
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

export enum TalkingPoint {
  // Inventor
  INVENTOR_GREETED,

  // Strange
  STRANGER_GREETED,
}
