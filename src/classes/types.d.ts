export interface Interactive {
  onInteract(keys: { [key: string]: Phaser.Input.Keyboard.Key } | undefined): boolean;
}

export interface Rewindable {
  history: Phaser.Math.Vector3[];
  rewinding: boolean;

  record(): void;
  rewind(): void;
  setRewind(rewind: boolean): void;
}
