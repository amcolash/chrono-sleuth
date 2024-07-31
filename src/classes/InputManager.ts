import { Scene } from 'phaser';

export enum Key {
  Up,
  Down,
  Left,
  Right,
  Continue,
  Back,
}

export class InputManager {
  scene: Scene;

  keys: Record<Key, boolean> = {
    [Key.Up]: false,
    [Key.Down]: false,
    [Key.Left]: false,
    [Key.Right]: false,
    [Key.Continue]: false,
    [Key.Back]: false,
  };

  constructor(scene: Scene) {
    this.scene = scene;

    this.listener(Key.Left, 'LEFT');
    this.listener(Key.Right, 'RIGHT');
    this.listener(Key.Up, 'UP');
    this.listener(Key.Down, 'DOWN');

    this.listener(Key.Up, 'W');
    this.listener(Key.Left, 'A');
    this.listener(Key.Down, 'S');
    this.listener(Key.Right, 'D');

    this.listener(Key.Continue, 'SPACE');
    this.listener(Key.Continue, 'ENTER');
    this.listener(Key.Back, 'BACKSPACE');
  }

  listener(key: Key, str: string) {
    this.scene.input.keyboard?.on(`keydown-${str}`, () => (this.keys[key] = true));
    this.scene.input.keyboard?.on(`keyup-${str}`, () => (this.keys[key] = false));
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
