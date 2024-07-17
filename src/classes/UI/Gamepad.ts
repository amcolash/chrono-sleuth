import { GameObjects, Scene } from 'phaser';

import { Config } from '../../config';
import { Colors, getColorNumber } from '../../utils/colors';

const buttonAlpha = 0.8;
const backgroundAlpha = 0.45;

export class Gamepad extends GameObjects.Container {
  buttons: GameObjects.Arc[] = [];

  constructor(scene: Scene, minimal?: boolean) {
    super(scene, 100, Config.height - 100);
    this.setScrollFactor(0).setDepth(5);
    scene.add.existing(this);

    // D-pad
    const dpadContainer = scene.add.container(20, -10).setInteractive().setDepth(5);
    this.add(dpadContainer);

    // D-pad background
    const dpad = scene.add
      .circle(0, 0, 60, getColorNumber(Colors.Teal), backgroundAlpha)
      .setStrokeStyle(3, getColorNumber(Colors.Black));
    dpadContainer.add(dpad);

    this.button(-57, 0, 'LEFT', dpadContainer);
    this.button(57, 0, 'RIGHT', dpadContainer);
    this.button(0, -57, 'UP', dpadContainer);
    this.button(0, 57, 'DOWN', dpadContainer);

    if (!minimal) {
      // Buttons
      const buttonsContainer = scene.add.container(Config.width - 340, 0);
      this.add(buttonsContainer);

      // Buttons background
      const buttons = scene.add
        .circle(40, 0, 65, getColorNumber(Colors.Teal), backgroundAlpha)
        .setStrokeStyle(3, getColorNumber(Colors.Black))
        .setScale(1, 0.6)
        .setAngle(-30);
      buttonsContainer.add(buttons);

      this.button(80, -20, 'ENTER', buttonsContainer);
      this.button(0, 20, 'ESCAPE', buttonsContainer);
    }
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
