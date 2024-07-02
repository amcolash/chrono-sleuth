import { createWalkAnimations, updateAnim } from '../utils/animations';
import { Player } from './Player';

const texture = 'alien';
const size = 2;
export const speed = 30 * size;

export class Alien extends Phaser.Physics.Arcade.Sprite {
  keys: { [key: string]: Phaser.Input.Keyboard.Key } | undefined;
  player: Player;

  constructor(scene: Phaser.Scene, x: number, y: number, player: Player) {
    super(scene, x, y, texture, 6);

    createWalkAnimations(texture, scene, this, 7);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setBodySize(18, 36);
    this.setOffset(7, 12);
    this.setPushable(false);

    this.scale = size;
    this.player = player;
  }

  update() {
    updateAnim(texture, this);
    this.scene.physics.moveTo(this, this.player.x, this.player.y, speed);
  }
}
