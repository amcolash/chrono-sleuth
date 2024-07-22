import { Math, Physics, Scene } from 'phaser';

import { Config } from '../config';
import { Game } from '../scenes/Game';

export class Slope extends Physics.Arcade.Sprite {
  size: number;

  constructor(scene: Scene, x: number, y: number, size: number = 100) {
    super(scene, x, y, 'slope');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setVisible(false);

    this.scene = scene;
    this.size = size;

    if (this.body) {
      this.body.setSize(size, size * 1.5);
    }

    if (Config.debug) {
      const graphics = scene.add.graphics();
      graphics.lineStyle(2, 0x00ff00, 1);

      const half = size / 2;
      graphics.lineBetween(x - half, y + half, x + half, y - half);
      graphics.lineBetween(x - half, y + half, x - size, y + half);
      graphics.lineBetween(x + half, y - half, x + size, y - half);
    }
  }

  update(_time: number, _delta: number) {
    const player = (this.scene as Game).player;

    if (this.body && this.scene.physics.world.intersects(this.body, player.body)) {
      const half = this.size / 2;

      let newY = this.x - player.x + this.y - player.displayHeight / 2;

      const clampOffset = player.displayHeight * 0.35;
      newY = Math.Clamp(newY, this.y - half - clampOffset, this.y + half - clampOffset);

      player.setY(newY);
    }
  }
}
