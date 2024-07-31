import { GameObjects } from 'phaser';

import { Config } from '../config';
import { Layer } from '../utils/layers';

export class DebugLight extends GameObjects.GameObject {
  x: number;
  y: number;
  light: GameObjects.Light;
  debug: GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, radius: number, color: number, intensity: number) {
    super(scene, 'Light');
    scene.add.existing(this);

    this.light = scene.lights.addLight(x, y, radius, color, intensity);
    this.debug = scene.add.graphics({ x, y }).setDepth(Layer.Debug);
    this.debug.lineStyle(3, 0x00ff00);

    this.x = x;
    this.y = y;

    if (Config.debug) {
      this.debug.strokeCircle(0, 0, radius);
    }
  }

  setPosition(x: number, y: number) {
    this.debug.setVisible(this.light.visible);

    this.light.setPosition(x, y);
    this.debug.setPosition(x, y);

    this.x = x;
    this.y = y;
  }

  destroy(fromScene?: boolean): void {
    super.destroy(fromScene);
    this.debug.destroy();
    this.scene?.lights?.removeLight(this.light);
  }
}
