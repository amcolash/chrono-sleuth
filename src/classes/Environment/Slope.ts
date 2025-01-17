import { GameObjects, Math as PhaserMath, Physics } from 'phaser';

import { Config } from '../../config';
import { Layer } from '../../data/layers';
import { LazyInitialize } from '../../data/types';
import { Game } from '../../scenes/Game';
import { shouldInitialize } from '../../utils/util';
import { speed } from '../Player/Player';
import { Key } from '../UI/InputManager';

export class Slope extends Physics.Arcade.Image implements LazyInitialize {
  scene: Game;
  width: number;
  height: number;
  flipped: boolean;
  upwards: boolean;
  graphics: GameObjects.Graphics;
  initialized: boolean = false;

  constructor(
    scene: Game,
    x: number,
    y: number,
    width: number = 100,
    height: number = 100,
    flipped: boolean = false,
    upwards: boolean = false
  ) {
    super(scene, x, y, '');
    this.name = `Slope-${x}-${y}`;
    this.scene = scene;

    this.width = width;
    this.height = height;
    this.flipped = flipped;
    this.upwards = upwards;
  }

  lazyInit(forceInit?: boolean) {
    if (!forceInit && (this.initialized || !shouldInitialize(this, this.scene.player))) return;

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    this.setOrigin(0)
      .setDepth(Layer.Items)
      .setVisible(Config.debug)
      .setSize(this.width, this.height * 1.5);

    if (Config.debug) {
      this.setInteractive({ draggable: true });

      const graphics = this.scene.add.graphics().setDepth(Layer.Debug);
      this.graphics = graphics;

      graphics.lineStyle(2, 0x00ff00, 1);

      const halfWidth = this.width / 2;

      const left = new PhaserMath.Vector2(0, this.flipped ? 0 : 0 + this.height);
      const right = new PhaserMath.Vector2(0 + this.width, this.flipped ? 0 + this.height : 0);

      graphics.lineBetween(left.x, left.y, right.x, right.y);
      graphics.lineBetween(left.x - halfWidth, left.y, left.x, left.y);
      graphics.lineBetween(right.x, right.y, right.x + halfWidth, right.y);

      graphics.strokeCircle(left.x, left.y, 2);
      graphics.strokeCircle(right.x, right.y, 2);
    }

    this.initialized = true;
  }

  update(_time: number, _delta: number) {
    this.lazyInit();
    if (!this.initialized) return;

    this.graphics?.setPosition(this.x, this.y);

    const player = this.scene.player;
    const keys = player.keys.keys;

    if (
      this.body &&
      this.scene.physics.world.intersects(this.body as Physics.Arcade.Body, player.body as Physics.Arcade.Body)
    ) {
      if (!player.active || keys[Key.Shift]) return;

      let horizontalPercent = PhaserMath.Clamp(1 - (this.x + this.width - player.x) / this.width, 0, 1);
      if (this.flipped) horizontalPercent = 1 - horizontalPercent;

      const bottom = this.y + this.height;
      const offset = (1 - player.originY) * player.displayHeight;
      const newY = bottom - this.height * horizontalPercent - offset;

      // if up key pressed and player is close to the slope, move up
      if (this.upwards && keys[Key.Up] && Math.abs(player.y - newY) < 70) {
        player.setVelocityX(this.flipped ? -speed : speed);
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
