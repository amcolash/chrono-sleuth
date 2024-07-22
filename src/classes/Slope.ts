import { Math, Physics, Scene } from 'phaser';

import { Config } from '../config';
import { Game } from '../scenes/Game';

export class Slope extends Physics.Arcade.Image {
  width: number;
  height: number;

  constructor(scene: Scene, x: number, y: number, width: number = 100, height: number = 100) {
    super(scene, x, y, '');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.scene = scene;
    this.width = width;
    this.height = height;

    this.setOrigin(0);

    this.setVisible(false);
    this.setSize(width, height * 1.5);

    if (Config.debug) {
      const graphics = scene.add.graphics();
      graphics.lineStyle(2, 0x00ff00, 1);

      const halfWidth = width / 2;

      graphics.lineBetween(x, y + height, x + width, y);
      graphics.lineBetween(x, y + height, x - halfWidth, y + height);
      graphics.lineBetween(x + width, y, x + width + halfWidth, y);

      graphics.strokeCircle(x + width, y, 2);
      graphics.strokeCircle(x, y + height, 2);
    }
  }

  update(time: number, delta: number) {
    const player = (this.scene as Game).player;

    if (this.body && this.scene.physics.world.intersects(this.body, player.body)) {
      const horizontalPercent = Math.Clamp(1 - (this.x + this.width - player.x) / this.width, 0, 1);

      const bottom = this.y + this.height;
      const offset = (1 - player.originY) * player.displayHeight;
      const newY = bottom - this.height * horizontalPercent - offset;

      player.setY(newY);
    }
  }
}
