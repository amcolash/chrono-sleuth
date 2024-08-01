import { GameObjects, Math, Physics, Scene } from 'phaser';

import { Config } from '../../config';
import { Game } from '../../scenes/Game';

export class Slope extends Physics.Arcade.Image {
  width: number;
  height: number;
  flipped: boolean;
  graphics: GameObjects.Graphics;

  constructor(scene: Scene, x: number, y: number, width: number = 100, height: number = 100, flip: boolean = false) {
    super(scene, x, y, '');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.scene = scene;
    this.width = width;
    this.height = height;
    this.flipped = flip;

    this.setOrigin(0);

    this.setVisible(false);
    this.setSize(width, height * 1.5);

    if (Config.debug) {
      const graphics = scene.add.graphics();
      this.graphics = graphics;

      graphics.lineStyle(2, 0x00ff00, 1);

      const halfWidth = width / 2;

      const left = new Math.Vector2(x, flip ? y : y + height);
      const right = new Math.Vector2(x + width, flip ? y + height : y);

      graphics.lineBetween(left.x, left.y, right.x, right.y);
      graphics.lineBetween(left.x - halfWidth, left.y, left.x, left.y);
      graphics.lineBetween(right.x, right.y, right.x + halfWidth, right.y);

      graphics.strokeCircle(left.x, left.y, 2);
      graphics.strokeCircle(right.x, right.y, 2);
    }
  }

  update(_time: number, _delta: number) {
    const player = (this.scene as Game).player;

    if (
      this.body &&
      this.scene.physics.world.intersects(this.body as Physics.Arcade.Body, player.body as Physics.Arcade.Body)
    ) {
      let horizontalPercent = Math.Clamp(1 - (this.x + this.width - player.x) / this.width, 0, 1);
      if (this.flipped) horizontalPercent = 1 - horizontalPercent;

      const bottom = this.y + this.height;
      const offset = (1 - player.originY) * player.displayHeight;
      const newY = bottom - this.height * horizontalPercent - offset;

      player.setY(newY);
    }
  }
}
