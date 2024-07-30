import { GameObjects } from 'phaser';

import { Colors, getColorNumber } from '../utils/colors';
import { Layer } from '../utils/layers';

const radius1 = 50;
const radius2 = 40;
const radius3 = 25;

const speed = 20;
const PI2 = Math.PI * 2;

const sec = 1000 * 60;
const min = sec * 60;
const hour = min * 12;

export class ClockHands extends GameObjects.Graphics {
  angle1: number = 0;
  angle2: number = 1;
  angle3: number = 4;

  update1: boolean = false;
  update2: boolean = false;
  update3: boolean = false;

  constructor(scene: Phaser.Scene) {
    super(scene);
    scene.add.existing(this);

    this.setPosition(842, -2107);
    this.setDepth(Layer.Npcs);
  }

  update(time: number): void {
    if (this.update1) this.angle1 = PI2 * (time / sec) * speed;
    if (this.update2) this.angle2 = PI2 * (time / min) * speed;
    if (this.update3) this.angle3 = PI2 * (time / hour) * speed;

    this.clear();

    this.lineStyle(6, getColorNumber(Colors.Night));
    this.lineBetween(0, 0, Math.cos(this.angle1) * radius1, Math.sin(this.angle1) * radius1);
    this.lineBetween(0, 0, Math.cos(this.angle2) * radius2, Math.sin(this.angle2) * radius2);
    this.lineBetween(0, 0, Math.cos(this.angle3) * radius3, Math.sin(this.angle3) * radius3);

    this.lineStyle(4, getColorNumber(Colors.Black));
    for (let i = 0; i < 12; i++) {
      const angle = PI2 * (i / 12);
      const x = Math.cos(angle) * radius1;
      const y = Math.sin(angle) * radius1;

      this.lineBetween(x, y, x * 1.5, y * 1.5);
    }
  }
}
