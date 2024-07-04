export enum InteractResult {
  None,
  Teleported,
  Talked,
}

export interface Interactive {
  onInteract(keys: { [key: string]: Phaser.Input.Keyboard.Key } | undefined): InteractResult;
}

export interface Rewindable {
  history: Phaser.Math.Vector3[];
  rewinding: boolean;

  record(): void;
  rewind(): void;
  setRewind(rewind: boolean): void;
}
