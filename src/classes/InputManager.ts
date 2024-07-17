import { Scene } from 'phaser';

export enum Key {
  Up,
  Down,
  Left,
  Right,
  Continue,
  Back,
}

// TODO: Add support for gamepad

export class InputManager {
  keys: Record<Key, boolean> = {
    [Key.Up]: false,
    [Key.Down]: false,
    [Key.Left]: false,
    [Key.Right]: false,
    [Key.Continue]: false,
    [Key.Back]: false,
  };

  constructor(scene: Scene) {
    scene.input.keyboard?.on('keydown-LEFT', () => (this.keys[Key.Left] = true));
    scene.input.keyboard?.on('keydown-A', () => (this.keys[Key.Left] = true));
    scene.input.keyboard?.on('keydown-RIGHT', () => (this.keys[Key.Right] = true));
    scene.input.keyboard?.on('keydown-D', () => (this.keys[Key.Right] = true));
    scene.input.keyboard?.on('keydown-UP', () => (this.keys[Key.Up] = true));
    scene.input.keyboard?.on('keydown-W', () => (this.keys[Key.Up] = true));
    scene.input.keyboard?.on('keydown-DOWN', () => (this.keys[Key.Down] = true));
    scene.input.keyboard?.on('keydown-S', () => (this.keys[Key.Down] = true));

    scene.input.keyboard?.on('keydown-SPACE', () => (this.keys[Key.Continue] = true));
    scene.input.keyboard?.on('keydown-ENTER', () => (this.keys[Key.Continue] = true));
    scene.input.keyboard?.on('keydown-ESC', () => (this.keys[Key.Back] = true));

    scene.input.keyboard?.on('keyup-LEFT', () => (this.keys[Key.Left] = false));
    scene.input.keyboard?.on('keyup-A', () => (this.keys[Key.Left] = false));
    scene.input.keyboard?.on('keyup-RIGHT', () => (this.keys[Key.Right] = false));
    scene.input.keyboard?.on('keyup-D', () => (this.keys[Key.Right] = false));
    scene.input.keyboard?.on('keyup-UP', () => (this.keys[Key.Up] = false));
    scene.input.keyboard?.on('keyup-W', () => (this.keys[Key.Up] = false));
    scene.input.keyboard?.on('keyup-DOWN', () => (this.keys[Key.Down] = false));
    scene.input.keyboard?.on('keyup-S', () => (this.keys[Key.Down] = false));

    scene.input.keyboard?.on('keyup-SPACE', () => (this.keys[Key.Continue] = false));
    scene.input.keyboard?.on('keyup-ENTER', () => (this.keys[Key.Continue] = false));
    scene.input.keyboard?.on('keyup-ESC', () => (this.keys[Key.Back] = false));
  }

  resetKeys() {
    this.keys[Key.Up] = false;
    this.keys[Key.Down] = false;
    this.keys[Key.Left] = false;
    this.keys[Key.Right] = false;
    this.keys[Key.Continue] = false;
    this.keys[Key.Back] = false;
  }
}
