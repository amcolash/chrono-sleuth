import { GameObjects, Input, Scene } from 'phaser';

import { Config } from '../../config';
import { Colors, getColorNumber } from '../../utils/colors';
import { Notification } from './Notification';

const buttonAlpha = 0.8;
const backgroundAlpha = 0.45;
const deadzone = 0.1;

export class Gamepad extends GameObjects.Container {
  buttons: GameObjects.Arc[] = [];
  lastAxisKey?: string;

  constructor(scene: Scene, minimal?: boolean) {
    super(scene, 100, Config.height - 100);
    this.setScrollFactor(0).setDepth(5);

    scene.add.existing(this);

    this.createDPad();
    if (!minimal) this.createButtons();

    this.createControllerListeners();
  }

  update(time: number, delta: number) {
    const pad = this.scene.input.gamepad?.pad1;
    if (!pad) return;

    const axis = pad.axes[0].getValue();

    if (Math.abs(axis) <= deadzone && this.lastAxisKey) {
      this.scene.input.keyboard?.emit('keyup-' + this.lastAxisKey);
      this.lastAxisKey = undefined;
      return;
    }

    if (axis > deadzone) {
      if (this.lastAxisKey === 'RIGHT') return;
      else if (this.lastAxisKey === 'LEFT') this.scene.input.keyboard?.emit('keyup-LEFT');

      this.scene.input.keyboard?.emit('keydown-RIGHT');
      this.lastAxisKey = 'RIGHT';
    }
    if (axis < -deadzone) {
      if (this.lastAxisKey === 'LEFT') return;
      else if (this.lastAxisKey === 'RIGHT') this.scene.input.keyboard?.emit('keyup-RIGHT');

      this.scene.input.keyboard?.emit('keydown-LEFT');
      this.lastAxisKey = 'LEFT';
    }
  }

  createDPad() {
    // D-pad
    const dpadContainer = this.scene.add.container(20, -10);
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
    const buttonsContainer = this.scene.add.container(Config.width - 340, 0);
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
    this.scene.input.gamepad?.on('connected', (pad: typeof Input.Gamepad) => {
      new Notification(this.scene, `Gamepad connected`);
    });

    this.scene.input.gamepad?.on('disconnected', (pad: typeof Input.Gamepad) => {
      new Notification(this.scene, `Gamepad disconnected`);
    });

    this.scene.input.gamepad?.on('down', (pad: typeof Input.Gamepad, button: Input.Gamepad.Button) => {
      const key = this.getKeyFromButton(button);
      if (key) this.scene.input.keyboard?.emit(`keydown-${key}`);

      console.log('down', button);
    });

    this.scene.input.gamepad?.on('up', (_pad: typeof Input.Gamepad, button: Input.Gamepad.Button) => {
      const key = this.getKeyFromButton(button);
      if (key) this.scene.input.keyboard?.emit(`keyup-${key}`);

      console.log('up', button);
    });
  }

  getKeyFromButton(button: Input.Gamepad.Button): string | undefined {
    let key;
    switch (button.index) {
      case 0: // Bottom (A/B)
        if (button.pad.id.toLowerCase().includes('nintendo')) {
          key = 'BACKSPACE';
        } else {
          key = 'ENTER';
        }
        break;
      case 1: // Right (A/B)
        if (button.pad.id.toLowerCase().includes('nintendo')) {
          key = 'ENTER';
        } else {
          key = 'BACKSPACE';
        }
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

  offsetButtons(dialog: boolean) {
    if (dialog) {
      this.setPosition(100, Config.height - 300);
    } else {
      this.setPosition(100, Config.height - 100);
    }
  }
}
