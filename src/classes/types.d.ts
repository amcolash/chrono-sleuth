export interface Interactive {
  onInteract(keys: { [key: string]: Phaser.Input.Keyboard.Key } | undefined): boolean;
}
