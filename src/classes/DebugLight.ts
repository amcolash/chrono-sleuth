import { GameObjects } from 'phaser';

import { Config } from '../config';
import { Layer } from '../utils/layers';

export class DebugLight extends GameObjects.GameObject {
  light: GameObjects.Light;
  debug: GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, radius: number, color: number, intensity: number) {
    super(scene, 'Light');
    scene.add.existing(this);

    this.light = scene.lights.addLight(x, y, radius, color, intensity);
    this.debug = scene.add.graphics({ x, y }).setDepth(Layer.Debug);
    this.debug.lineStyle(3, 0x00ff00);

    if (Config.debug) {
      this.debug.strokeCircle(0, 0, radius);
    }
  }

  setPosition(x: number, y: number) {
    this.light.setPosition(x, y);
    this.debug.setPosition(x, y);
  }
}
