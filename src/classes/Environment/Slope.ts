import { GameObjects, Math as PhaserMath, Physics } from 'phaser';

import { Config } from '../../config';
import { Game } from '../../scenes/Game';
import { speed } from '../Player/Player';
import { Key } from '../UI/InputManager';

export class Slope extends Physics.Arcade.Image {
  scene: Game;
  width: number;
  height: number;
  flipped: boolean;
  upwards: boolean;
  graphics: GameObjects.Graphics;

  constructor(
    scene: Game,
    x: number,
    y: number,
    width: number = 100,
    height: number = 100,
    flip: boolean = false,
    upwards: boolean = false
  ) {
    super(scene, x, y, '');
    this.scene = scene;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.width = width;
    this.height = height;
    this.flipped = flip;
    this.upwards = upwards;

    this.setOrigin(0);

    if (!Config.debug) this.setVisible(false);
    this.setSize(width, height * 1.5);

    if (Config.debug) {
      this.setInteractive({ draggable: true });

      const graphics = scene.add.graphics();
      this.graphics = graphics;

      graphics.lineStyle(2, 0x00ff00, 1);

      const halfWidth = width / 2;

      const left = new PhaserMath.Vector2(0, flip ? 0 : 0 + height);
      const right = new PhaserMath.Vector2(0 + width, flip ? 0 + height : 0);

      graphics.lineBetween(left.x, left.y, right.x, right.y);
      graphics.lineBetween(left.x - halfWidth, left.y, left.x, left.y);
      graphics.lineBetween(right.x, right.y, right.x + halfWidth, right.y);

      graphics.strokeCircle(left.x, left.y, 2);
      graphics.strokeCircle(right.x, right.y, 2);
    }
  }

  update(_time: number, _delta: number) {
    if (Config.debug && this.graphics) {
      this.graphics.setPosition(this.x, this.y);
    }

    const player = this.scene.player;
    const keys = player.keys.keys;

    if (
      this.body &&
      this.scene.physics.world.intersects(this.body as Physics.Arcade.Body, player.body as Physics.Arcade.Body)
    ) {
      let horizontalPercent = PhaserMath.Clamp(1 - (this.x + this.width - player.x) / this.width, 0, 1);
      if (this.flipped) horizontalPercent = 1 - horizontalPercent;

      const bottom = this.y + this.height;
      const offset = (1 - player.originY) * player.displayHeight;
      const newY = bottom - this.height * horizontalPercent - offset;

      // if up key pressed and player is close to the slope, move up
      if (this.upwards && keys[Key.Up] && Math.abs(player.y - newY) < 70) {
        player.setVelocityX(this.flipped ? -speed : speed);
        player.setFlipX(this.flipped);
        player.setY(newY);
        return;
      }

      // if moving left/right and above ground, move up
      if (this.upwards && (keys[Key.Right] || (keys[Key.Left] && this.flipped)) && player.y < bottom - 70) {
        player.setY(newY);
        return;
      }

      if (this.upwards && newY < player.y) return;

      player.setY(newY);
    }
  }
}
