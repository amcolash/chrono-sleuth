import { GameObjects, Scene } from 'phaser';
import { Config } from '../config';
import { Rewindable } from './types.';
import { Colors, fontStyle, getColorNumber } from '../utils/colors';
import { Player } from './Player';

export const dayDuration = 1000 * 60 * Config.dayMinutes;
export const rewindInterval = 250;
export const rewindSpeed = 8;

export class Clock extends GameObjects.Container {
  currentTime: number = 0;
  player: Player;
  rewindable: Rewindable[];
  rewinding: boolean = false;
  counter: number = 0;

  bar: GameObjects.Rectangle;
  hand: GameObjects.Rectangle;
  timeText: GameObjects.Text;
  dayOver: GameObjects.Text;

  constructor(scene: Scene, rewindable: Rewindable[], player: Player) {
    super(scene, 40, Config.height - 60);
    this.setVisible(Config.rewindEnabled).setDepth(1).setScrollFactor(0);
    this.scene.add.existing(this);

    this.rewindable = rewindable;
    this.player = player;

    this.add(scene.add.sprite(0, 0, 'watch').setScale(0.25));

    this.hand = scene.add.rectangle(0, 10, 3, 14, getColorNumber(Colors.Black)).setOrigin(0, 0);
    this.add(this.hand);

    this.timeText = scene.add.text(15, 10, '', fontStyle).setScrollFactor(0);
    this.bar = scene.add.rectangle(0, Config.height - 6, 0, 6, 0xccaa00).setScrollFactor(0);

    if (Config.rewindEnabled) {
      this.scene.input.keyboard?.on('keydown-SHIFT', () => {
        this.rewinding = true;
        this.rewindable.forEach((r) => r.setRewind(true));
      });

      this.scene.input.keyboard?.on('keyup-SHIFT', () => {
        this.rewinding = false;
        this.rewindable.forEach((r) => r.setRewind(false));
      });
    }
  }

  update(_time: number, delta: number) {
    if (!Config.rewindEnabled) return;

    const dayProgress = this.currentTime / Config.dayMinutes;
    this.bar.width = Config.width * dayProgress;

    const hours = Math.floor((this.currentTime / 1000 / 60 / 60) % 24);
    const minutes = Math.floor((this.currentTime / 1000 / 60) % 60);
    const seconds = Math.floor((this.currentTime / 1000) % 60);

    this.timeText.setText(`${hours}:${minutes}:${seconds}`);

    this.hand.setRotation((this.currentTime / dayDuration) * 2 * Math.PI + Math.PI);

    if (this.currentTime > dayDuration && !this.rewinding && !this.player.message.visible) {
      this.dayOver = this.scene.add.text(250, 250, 'Day Over', { ...fontStyle, fontSize: 96 }).setScrollFactor(0);

      this.rewinding = true;
      this.rewindable.forEach((r) => r.setRewind(true));
    }

    if (this.rewinding) {
      if (this.currentTime > 0) {
        this.currentTime = Math.max(0, this.currentTime - delta * rewindSpeed);
      } else {
        this.rewinding = false;
        this.rewindable.forEach((r) => r.setRewind(false));
        this.dayOver?.destroy();
      }
    } else if (!this.player.message.visible) {
      if (this.counter > rewindInterval) {
        this.rewindable.forEach((r) => r.record());
        this.counter = 0;
      }

      this.counter += delta;
      this.currentTime += delta;
    }

    this.timeText.setText(`Time: ${Math.floor(this.currentTime / 1000)}`);
    this.bar.width = (this.currentTime / dayDuration) * Config.width;
  }
}
