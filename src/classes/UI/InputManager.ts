import { Scene } from 'phaser';

export enum Key {
  Up,
  Down,
  Left,
  Right,
  Continue,
  Back,
  Shift,
}

export class InputManager {
  scene: Scene;

  keys: Record<Key, boolean> = Object.keys(Key)
    .map(Number)
    .reduce((acc, key) => ({ ...acc, [key]: false }), {}) as Record<Key, boolean>;

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
    this.listener(Key.Shift, 'SHIFT');
  }

  listener(key: Key, str: string) {
    this.scene.input.keyboard?.on(`keydown-${str}`, () => (this.keys[key] = true));
    this.scene.input.keyboard?.on(`keyup-${str}`, () => (this.keys[key] = false));
  }

  resetKeys() {
    const entries = Object.entries(this.keys);
    entries.forEach(([key, _]) => (this.keys[Number(key) as Key] = false));
  }
}
