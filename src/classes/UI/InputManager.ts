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

export type InputType = 'mouse' | 'keyboard' | 'gamepad';

export class InputManager {
  scene: Scene;

  keys: Record<Key, boolean> = Object.keys(Key)
    .map(Number)
    .reduce((acc, key) => ({ ...acc, [key]: false }), {}) as Record<Key, boolean>;

  /** Keep track of last input type. Use this to determine which icons to show in button prompt */
  lastInput: InputType;

  constructor(scene: Scene) {
    this.scene = scene;

    this.listener(Key.Left, 'LEFT');
    this.listener(Key.Right, 'RIGHT');
    this.listener(Key.Up, 'UP');
    this.listener(Key.Down, 'DOWN');

    this.listener(Key.Up, 'W', 'UP');
    this.listener(Key.Left, 'A', 'LEFT');
    this.listener(Key.Down, 'S', 'DOWN');
    this.listener(Key.Right, 'D', 'RIGHT');

    this.listener(Key.Continue, 'SPACE', 'ENTER');
    this.listener(Key.Continue, 'ENTER');
    this.listener(Key.Back, 'BACKSPACE');
    this.listener(Key.Shift, 'SHIFT');

    this.scene.input.on('pointerdown', () => {
      this.lastInput = 'mouse';
    });

    const onPointerMove = () => (this.lastInput = 'mouse');

    window.document.addEventListener('pointermove', onPointerMove);
    scene.events.on('destroy', () => window.removeEventListener('pointermove', onPointerMove));
  }

  listener(key: Key, str: string, emitName?: string) {
    this.scene.input.keyboard?.on(`keydown-${str}`, (e: unknown) => {
      if (emitName) this.scene.input.keyboard?.emit(`keydown-${emitName}`);
      this.keys[key] = true;
      if (e) this.lastInput = 'keyboard';
      else this.lastInput = 'gamepad';
    });
    this.scene.input.keyboard?.on(`keyup-${str}`, (e: unknown) => {
      if (emitName) this.scene.input.keyboard?.emit(`keyup-${emitName}`);
      this.keys[key] = false;
      if (e) this.lastInput = 'keyboard';
      else this.lastInput = 'gamepad';
    });
  }

  resetKeys() {
    const entries = Object.entries(this.keys);
    entries.forEach(([key, _]) => (this.keys[Number(key) as Key] = false));
  }
}
