import { GameObjects, Scene } from 'phaser';

import { Config } from '../../config';
import { Layer } from '../../data/layers';

export class DebugLight extends GameObjects.GameObject {
  x: number;
  y: number;
  light: GameObjects.Light;
  debug: GameObjects.Graphics;

  constructor(scene: Scene, x: number, y: number, radius: number, color: number, intensity: number) {
    super(scene, 'DebugLight');
    scene.add.existing(this);

    this.light = scene.lights.addLight(x, y, radius, color, intensity);
    this.debug = scene.add.graphics({ x, y }).setDepth(Layer.Debug);
    this.debug.lineStyle(3, 0x00ff00);

    // This name is used to dim opacity (when not visible) inside lighting.ts
    this.debug.name = 'DebugLightGraphics';

    this.x = x;
    this.y = y;

    if (Config.debug) {
      this.debug.strokeCircle(0, 0, radius);
    }
  }

  setPosition(x: number, y: number) {
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
