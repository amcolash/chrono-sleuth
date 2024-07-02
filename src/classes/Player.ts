import { createWalkAnimations, updateAnim } from '../utils/animations';
import { Interactive } from './types';

const texture = 'robot';
const size = 2.5;
const speed = 120 * size;

const steps = 30;

export class Player extends Phaser.Physics.Arcade.Sprite {
  keys: { [key: string]: Phaser.Input.Keyboard.Key } | undefined;
  interactive?: Interactive;
  history: { x: number; y: number }[] = [];
  count: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, texture, 6);

    this.keys = scene.input.keyboard?.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SHIFT') as { [key: string]: Phaser.Input.Keyboard.Key };

    // createWalkAnimations(texture, scene, this);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setBodySize(24, 36);
    this.setOffset(0, 0);
    this.setPushable(false);

    this.scale = size;

    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('character', { start: 0, end: 5 }),
      frameRate: 4,
      repeat: -1,
    });

    this.anims.play('walk');
  }

  update() {
    this.updateVelocity();

    if (Math.abs(this.body?.velocity.x || 0) > 0) {
      this.anims.resume();
      this.flipX = (this.body?.velocity.x || 0) < 0;
    } else this.anims.pause();
    // updateAnim(texture, this);

    this.setTint(this.interactive ? 0xff0000 : 0xffffff);

    if (this.history.length < 2000 && this.count % steps === 0) {
      this.history.push({ x: this.x, y: this.y });
      this.count = 0;
    }

    this.count++;
  }

  setInteractiveObject(interactive?: Interactive) {
    this.interactive = interactive;
  }

  updateVelocity() {
    if (this.keys) {
      const keys = {
        left: this.keys.LEFT.isDown || this.keys.A.isDown,
        right: this.keys.RIGHT.isDown || this.keys.D.isDown,
        up: this.keys.UP.isDown || this.keys.W.isDown,
        down: this.keys.DOWN.isDown || this.keys.S.isDown,
        shift: this.keys.SHIFT.isDown,
      };

      this.setVelocity(0);

      if (keys.shift && this.history.length > 0) {
        const point = this.history.pop();
        if (point) {
          this.x = point.x;
          this.y = point.y;
        }

        return;
      }

      if (this.interactive) {
        const ret = this.interactive.onInteract(this.keys);

        if (ret) {
          this.interactive = undefined;
          return;
        }
      }

      let calcSpeed = speed;

      if (keys.left) this.setVelocityX(-calcSpeed);
      if (keys.right) this.setVelocityX(calcSpeed);
      // if (keys.up) this.setVelocityY(-calcSpeed);
      // if (keys.down) this.setVelocityY(calcSpeed);

      if (keys.left && keys.right) this.setVelocityX(0);
      // if (keys.up && keys.down) this.setVelocityY(0);
    }
  }
}
