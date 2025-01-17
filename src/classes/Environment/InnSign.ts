import { GameObjects } from 'phaser';

import { Config } from '../../config';
import { Game } from '../../scenes/Game';
import { Colors, getColorNumber } from '../../utils/colors';
import { nearby } from '../../utils/util';
import { DebugLight } from '../Debug/DebugLight';

const speed = 0.01;
const scale = 0.5;

export class InnSign extends GameObjects.Image {
  scene: Game;
  timer: number = 0;
  target: number = 1;
  light: GameObjects.Light | DebugLight;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'inn_sign');
    scene.add.existing(this);

    this.scene = scene as Game;

    if (Config.debug) {
      this.light = new DebugLight(this.scene, this.x, this.y, 100, getColorNumber(Colors.Warning), 1.5);
    } else {
      this.light = this.scene.lights.addLight(this.x, this.y, 100, getColorNumber(Colors.Warning), 1.5);
    }

    this.setScale(scale);
  }

  update(): void {
    if (!nearby(this, this.scene.player, Config.width / 1.5)) return;

    if (this.alpha < this.target) {
      this.alpha += speed;
    } else if (this.alpha > this.target) {
      this.alpha -= speed;
    }

    this.light.setIntensity(this.alpha * 1.5);

    if (Date.now() > this.timer) {
      this.timer = Date.now() + Math.random() * 150;

      if (Math.random() > 0.8) this.timer += Math.random() * 750;

      if (this.target === 1) this.target = Math.random() * 0.3 + 0.5;
      else this.target = 1;
    }
  }
}
