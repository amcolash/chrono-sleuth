import { rewindInterval, rewindSpeed } from '../scenes/Game';
import { Message } from './Message';
import { Interactive, InteractResult, Rewindable } from './types.';

const texture = 'robot';
const size = 2.5;
const speed = 120 * size;
const MAX_HISTORY = 1000;

export class Player extends Phaser.Physics.Arcade.Sprite implements Rewindable {
  keys: { [key: string]: Phaser.Input.Keyboard.Key } | undefined;
  interactive?: Interactive;
  message: Message = new Message(this.scene);

  counter: number = 0;
  history: Phaser.Math.Vector3[] = [];
  rewinding = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, texture, 6);

    this.keys = scene.input.keyboard?.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SHIFT,ENTER,SPACE') as {
      [key: string]: Phaser.Input.Keyboard.Key;
    };

    // createWalkAnimations(texture, scene, this);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setBodySize(24, 36);
    this.setOffset(0, 0);
    this.setPushable(false);
    this.depth = 1;

    this.scale = size;

    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('character', { start: 0, end: 5 }),
      frameRate: 4,
      repeat: -1,
    });

    this.anims.play('walk');

    this.message = new Message(scene);
  }

  update(_time: number, delta: number) {
    this.setTint(this.body?.touching.none ? 0xffffff : 0xffaaaa);

    if (this.rewinding) {
      if (this.counter + delta > rewindInterval / rewindSpeed) {
        this.rewind();
        this.counter = 0;
      }
      this.counter += delta;
    } else {
      this.updateVelocity();
    }

    const v = this.body?.velocity.x || 0;
    const flipped = v < 0;
    if (Math.abs(v) > 0) {
      this.anims.resume();
      this.flipX = this.rewinding ? !flipped : flipped;
    } else this.anims.pause();
    // updateAnim(texture, this);
  }

  record() {
    if (this.history.length < MAX_HISTORY) this.history.push(new Phaser.Math.Vector3(this.x, this.y, this.body?.velocity.x || 0));
  }

  rewind() {
    this.setVelocityX(0);

    const point = this.history.pop();
    if (point) {
      this.x = point.x;
      this.y = point.y;
      this.setVelocityX(-point.z);
    }
  }

  setRewind(rewind: boolean): void {
    this.rewinding = rewind;
    this.counter = 0;
  }

  setInteractiveObject(interactive?: Interactive) {
    console.log('setInteractiveObject', interactive);
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

      if (this.interactive) {
        const ret: InteractResult = this.interactive.onInteract(this.keys);

        if (ret !== InteractResult.None) {
          if (ret === InteractResult.Teleported) this.interactive = undefined;

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

  setMessage(message?: string, id?: number) {
    this.message.setMessage(message);
  }
}
