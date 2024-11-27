import { GameObjects, Scene } from 'phaser';

import { Config } from '../../config';
import { Layer } from '../../data/layers';
import { Rewindable } from '../../data/types';
import { Colors, getColorNumber } from '../../utils/colors';
import { fontStyle } from '../../utils/fonts';
import { Player } from '../Player/Player';

export const dayDuration = 1000 * 60 * Config.dayMinutes;
export const rewindInterval = 250;
export const rewindSpeed = 8;

export class Clock extends GameObjects.Container {
  currentTime: number = 0;
  rewindCount: number = 0;
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
    this.name = 'Clock';

    this.setVisible(Config.rewindEnabled).setDepth(Layer.Ui).setScrollFactor(0);
    this.scene.add.existing(this);

    this.rewindable = rewindable;
    this.player = player;

    this.add(scene.add.image(0, 0, 'watch').setScale(0.25));

    this.hand = scene.add.rectangle(0, 10, 3, 14, getColorNumber(Colors.Black)).setOrigin(0, 0);
    this.add(this.hand);

    this.timeText = scene.add.text(15, 10, '', fontStyle).setScrollFactor(0);
    this.bar = scene.add.rectangle(0, Config.height - 6, 0, 6, 0xccaa00).setScrollFactor(0);

    this.scene.input.keyboard?.on('keydown-SHIFT', () => {
      this.rewinding = true;
      this.rewindable.forEach((r) => r.setRewind(true));
    });

    this.scene.input.keyboard?.on('keyup-SHIFT', () => {
      this.rewinding = false;
      this.rewindable.forEach((r) => r.setRewind(false));
    });
  }

  update(_time: number, delta: number) {
    const dayProgress = this.currentTime / Config.dayMinutes;
    this.bar.width = Config.width * dayProgress;

    const msHour = 60 * 60 * 1000;
    const modifiedTime = 7 * msHour + (this.currentTime / dayDuration) * 17 * msHour;
    const hours = Math.floor((modifiedTime / 1000 / 60 / 60) % 12);
    const minutes = Math.floor((modifiedTime / 1000 / 60) % 60);
    const am = modifiedTime / msHour < 12 ? 'AM' : 'PM';

    this.timeText.setText(`${hours === 0 ? '12' : hours}:${minutes.toString().padStart(2, '0')} ${am}`);

    this.hand.setAngle((modifiedTime / (msHour * 12)) * 360 + 180);

    if (this.currentTime > dayDuration && !this.rewinding && !this.player.message.visible) {
      this.dayOver = this.scene.add.text(250, 250, 'Day Over', { ...fontStyle, fontSize: 96 }).setScrollFactor(0);

      this.rewinding = true;
      this.rewindable.forEach((r) => r.setRewind(true));
    }

    if (this.rewinding) {
      if (this.currentTime > 0) {
        // Rewind time
        this.currentTime = Math.max(0, this.currentTime - delta * rewindSpeed);
      } else {
        // When rewinding is complete
        this.rewinding = false;
        this.rewindable.forEach((r) => {
          r.setRewind(false);
          if (r.reset) r.reset();
        });
        this.dayOver?.destroy();
        this.rewindCount++;
      }
    } else if (!this.player.message.visible) {
      if (this.counter > rewindInterval) {
        this.rewindable.forEach((r) => r.record());
        this.counter = 0;
      }

      this.counter += delta;
      this.currentTime += delta;
    }

    this.bar.width = (this.currentTime / dayDuration) * Config.width;
  }
}
