import { GameObjects } from 'phaser';

import { Layer } from '../utils/layers';

const radius1 = 50;
const radius2 = 40;
const radius3 = 25;

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
    if (this.update1) this.angle1 = (Math.PI * time) / 100;
    if (this.update2) this.angle2 = (Math.PI * time) / 6000;
    if (this.update3) this.angle3 = (Math.PI * time) / 36000;

    this.clear();

    this.lineStyle(4, 0x00ffff, 1);
    this.lineBetween(0, 0, Math.cos(this.angle1) * radius1, Math.sin(this.angle1) * radius1);
    this.lineBetween(0, 0, Math.cos(this.angle2) * radius2, Math.sin(this.angle2) * radius2);
    this.lineBetween(0, 0, Math.cos(this.angle3) * radius3, Math.sin(this.angle3) * radius3);
  }
}
