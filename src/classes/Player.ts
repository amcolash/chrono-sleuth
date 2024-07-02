import { createWalkAnimations, updateAnim } from '../utils/animations';

const texture = 'robot';
const size = 1.5;
const speed = 120 * size;
const maxSprint = 100;

export class Player extends Phaser.Physics.Arcade.Sprite {
  keys: { [key: string]: Phaser.Input.Keyboard.Key } | undefined;
  sprintBar: Phaser.GameObjects.Rectangle;
  sprint: number = maxSprint;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, texture, 6);

    this.keys = scene.input.keyboard?.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SHIFT') as { [key: string]: Phaser.Input.Keyboard.Key };

    createWalkAnimations(texture, scene, this);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setBodySize(28, 60);
    this.setOffset(10, 3);
    this.setPushable(false);

    const { width, height } = scene.game.config;
    this.sprintBar = scene.add.rectangle(0, (height as number) - 10, width as number, 10, 0x00cc00).setOrigin(0, 0);

    this.scale = size;
  }

  update() {
    this.updateVelocity();
    updateAnim(texture, this);
  }

  updateVelocity() {
    if (this.keys) {
      const keys = {
        left: this.keys.LEFT.isDown || this.keys.A.isDown,
        right: this.keys.RIGHT.isDown || this.keys.D.isDown,
        up: this.keys.UP.isDown || this.keys.W.isDown,
        down: this.keys.DOWN.isDown || this.keys.S.isDown,
      };

      this.setVelocity(0);

      let calcSpeed = speed;

      if (this.keys.SHIFT.isDown && this.sprint > 0) {
        calcSpeed = speed * 2;
        this.sprint -= 1;
      } else {
        this.sprint = Math.min(this.sprint + 0.5, maxSprint);
      }

      this.sprintBar.width = (this.sprint / maxSprint) * (this.scene.game.config.width as number);

      if (keys.left) this.setVelocityX(-calcSpeed);
      if (keys.right) this.setVelocityX(calcSpeed);
      if (keys.up) this.setVelocityY(-calcSpeed);
      if (keys.down) this.setVelocityY(calcSpeed);

      if (keys.left && keys.right) this.setVelocityX(0);
      if (keys.up && keys.down) this.setVelocityY(0);

      if (this.body && Math.abs(this.body.velocity.x) + Math.abs(this.body.velocity.y) > speed) {
        this.setVelocity(this.body.velocity.x * Math.sqrt(0.5), this.body.velocity.y * Math.sqrt(0.5));
      }
    }
  }
}
