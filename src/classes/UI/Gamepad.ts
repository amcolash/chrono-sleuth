import { GameObjects, Input, Scene } from 'phaser';

import { Config } from '../../config';
import { Layer } from '../../data/layers';
import { Colors, getColorNumber } from '../../utils/colors';
import { Notification } from './Notification';

const buttonAlpha = 0.8;
const backgroundAlpha = 0.45;
const deadzone = 0.1;

export class Gamepad extends GameObjects.Container {
  buttons: GameObjects.Arc[] = [];
  lastXAxisKey?: string;
  lastYAxisKey?: string;
  minimal?: boolean;

  constructor(scene: Scene, minimal?: boolean) {
    super(scene, 100, Config.height - 100);
    this.minimal = minimal;
    this.setScrollFactor(0).setDepth(Layer.Overlay);

    scene.add.group(this, { runChildUpdate: true });
    scene.add.existing(this);

    this.createControllerListeners();
  }

  createUI() {
    this.createDPad();
    if (!this.minimal) this.createButtons();
  }

  setVisible(value: boolean): this {
    super.setVisible(value);
    if (value && this.buttons.length === 0) this.createUI();
    return this;
  }

  update(_time: number, _delta: number) {
    const pad = this.scene.input.gamepad?.pad1;
    if (!pad) return;

    const xAxis = pad.axes[0].getValue();
    const yAxis = pad.axes[1].getValue();

    if (Math.abs(xAxis) <= deadzone && this.lastXAxisKey) {
      this.scene.input.keyboard?.emit('keyup-' + this.lastXAxisKey);
      this.lastXAxisKey = undefined;
      return;
    }

    if (xAxis > deadzone) {
      if (this.lastXAxisKey === 'RIGHT') return;
      else if (this.lastXAxisKey === 'LEFT') this.scene.input.keyboard?.emit('keyup-LEFT');

      this.scene.input.keyboard?.emit('keydown-RIGHT');
      this.lastXAxisKey = 'RIGHT';
    }
    if (xAxis < -deadzone) {
      if (this.lastXAxisKey === 'LEFT') return;
      else if (this.lastXAxisKey === 'RIGHT') this.scene.input.keyboard?.emit('keyup-RIGHT');

      this.scene.input.keyboard?.emit('keydown-LEFT');
      this.lastXAxisKey = 'LEFT';
    }

    if (Math.abs(yAxis) <= deadzone && this.lastYAxisKey) {
      this.scene.input.keyboard?.emit('keyup-' + this.lastYAxisKey);
      this.lastYAxisKey = undefined;
      return;
    }

    if (yAxis > deadzone) {
      if (this.lastYAxisKey === 'DOWN') return;
      else if (this.lastYAxisKey === 'UP') this.scene.input.keyboard?.emit('keyup-UP');

      this.scene.input.keyboard?.emit('keydown-DOWN');
      this.lastYAxisKey = 'DOWN';
    }
    if (yAxis < -deadzone) {
      if (this.lastYAxisKey === 'UP') return;
      else if (this.lastYAxisKey === 'DOWN') this.scene.input.keyboard?.emit('keyup-DOWN');

      this.scene.input.keyboard?.emit('keydown-UP');
      this.lastYAxisKey = 'UP';
    }
  }

  createDPad() {
    console.log('createDPad');

    // D-pad
    const dpadContainer = this.scene.add.container(10, -10);
    this.add(dpadContainer);

    // D-pad background
    const dpad = this.scene.add
      .circle(0, 0, 60, getColorNumber(Colors.Teal), backgroundAlpha)
      .setStrokeStyle(3, getColorNumber(Colors.Black));
    dpadContainer.add(dpad);

    this.button(-57, 0, 'LEFT', dpadContainer);
    this.button(57, 0, 'RIGHT', dpadContainer);
    this.button(0, -57, 'UP', dpadContainer);
    this.button(0, 57, 'DOWN', dpadContainer);
  }

  createButtons() {
    // Buttons
    const buttonsContainer = this.scene.add.container(Config.width - 300, 0);
    this.add(buttonsContainer);

    // Buttons background
    const buttons = this.scene.add
      .circle(40, 0, 65, getColorNumber(Colors.Teal), backgroundAlpha)
      .setStrokeStyle(3, getColorNumber(Colors.Black))
      .setScale(1, 0.6)
      .setAngle(-30);
    buttonsContainer.add(buttons);

    this.button(80, -20, 'ENTER', buttonsContainer);
    this.button(0, 20, 'BACKSPACE', buttonsContainer);
  }

  createControllerListeners() {
    this.scene.input.gamepad?.on('connected', (_pad: typeof Input.Gamepad) => {
      new Notification(this.scene, `Gamepad connected`);
    });

    this.scene.input.gamepad?.on('disconnected', (_pad: typeof Input.Gamepad) => {
      new Notification(this.scene, `Gamepad disconnected`);
    });

    this.scene.input.gamepad?.on('down', (_pad: typeof Input.Gamepad, button: Input.Gamepad.Button) => {
      const key = this.getKeyFromButton(button);
      if (key) this.scene.input.keyboard?.emit(`keydown-${key}`);
    });

    this.scene.input.gamepad?.on('up', (_pad: typeof Input.Gamepad, button: Input.Gamepad.Button) => {
      const key = this.getKeyFromButton(button);
      if (key) this.scene.input.keyboard?.emit(`keyup-${key}`);
    });
  }

  getKeyFromButton(button: Input.Gamepad.Button): string | undefined {
    const nintendo = button.pad.id.toLowerCase().includes('nintendo');
    let key;
    switch (button.index) {
      case 0: // Bottom (A/B)
        if (nintendo) key = 'BACKSPACE';
        else key = 'ENTER';
        break;
      case 1: // Right (B/A)
        if (nintendo) key = 'ENTER';
        else key = 'BACKSPACE';
        break;
      case 2: // Top (X/Y)
        if (nintendo) key = 'SHIFT';
        else key = 'BACK_SLASH';
        break;
      case 3: // Left (Y/X)
        if (nintendo) key = 'BACK_SLASH';
        else key = 'SHIFT';
        break;
      case 8: // Select
        key = 'J';
        break;
      case 9: // Start
        key = 'ESC';
        break;
      case 12: // D-pad up
        key = 'UP';
        break;
      case 13: // D-pad down
        key = 'DOWN';
        break;
      case 14: // D-pad left
        key = 'LEFT';
        break;
      case 15: // D-pad right
        key = 'RIGHT';
        break;
    }

    return key;
  }

  button(x: number, y: number, key: string, container: GameObjects.Container) {
    const size = key === 'ENTER' || key === 'ESCAPE' ? 35 : 38;

    const button = this.scene.add
      .circle(x, y, size, getColorNumber(Colors.White), buttonAlpha)
      .setStrokeStyle(3, getColorNumber(Colors.Black));
    button.setInteractive({ useHandCursor: true }).setScrollFactor(0);
    container.add(button);

    button.on('pointerdown', () => {
      this.scene.input.keyboard?.emit(`keydown-${key}`);
      button.setFillStyle(getColorNumber(Colors.Teal), Math.min(1, buttonAlpha + 0.25));
    });
    button.on('pointerup', () => {
      this.scene.input.keyboard?.emit(`keyup-${key}`);
      button.setFillStyle(getColorNumber(Colors.White), buttonAlpha);
    });
    button.on('pointerout', () => {
      this.scene.input.keyboard?.emit(`keyup-${key}`);
      button.setFillStyle(getColorNumber(Colors.White), buttonAlpha);
    });

    this.buttons.push(button);
  }

  resetButtons() {
    this.buttons.forEach((b) => b.setFillStyle(getColorNumber(Colors.White), buttonAlpha));
  }
}
