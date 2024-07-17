import { GameObjects } from 'phaser';

import { Config } from '../../config';
import { Game } from '../../scenes/Game';
import { Colors, getColorNumber } from '../../utils/colors';
import { Player } from '../Player';

const buttonAlpha = 0.8;
const backgroundAlpha = 0.45;

export class Gamepad extends GameObjects.Container {
  buttons: GameObjects.Arc[] = [];
  player: Player;

  constructor(scene: Game, player: Player) {
    super(scene, 100, Config.height - 100);
    this.setScrollFactor(0).setDepth(5);
    scene.add.existing(this);

    this.player = player;

    // D-pad
    const dpadContainer = scene.add.container(50, 0).setInteractive().setDepth(5);
    this.add(dpadContainer);

    // D-pad background
    const dpad = scene.add
      .circle(0, 0, 60, getColorNumber(Colors.Teal), backgroundAlpha)
      .setStrokeStyle(3, getColorNumber(Colors.Black));
    dpadContainer.add(dpad);

    this.button(-55, 0, 'LEFT', dpadContainer);
    this.button(55, 0, 'RIGHT', dpadContainer);
    this.button(0, -55, 'UP', dpadContainer);
    this.button(0, 55, 'DOWN', dpadContainer);

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

  button(x: number, y: number, key: string, container: GameObjects.Container) {
    const size = key === 'ENTER' || key === 'ESCAPE' ? 35 : 30;

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

    this.buttons.push(button);
  }

  offsetButtons(dialog: boolean) {
    if (dialog) {
      this.setPosition(100, Config.height - 300);
    } else {
      this.setPosition(100, Config.height - 100);
    }

    this.player.keys.resetKeys();

    this.scene.time.delayedCall(100, () => {
      this.buttons.forEach((button) => button.setFillStyle(getColorNumber(Colors.White), buttonAlpha));
    });
  }
}
