import { Player } from './Player';
import { Interactive } from './types';

const meta = [
  { x: 300, y: 650, img: 0 },
  { x: 300, y: 875, img: 1 },
  //  { x: 150, y: 650, img: 0},
  //  { x: 150, y: 650, img: 0},
];

export class Stairs extends Phaser.Physics.Arcade.Sprite implements Interactive {
  id: number;
  player: Player;

  constructor(scene: Phaser.Scene, id: number, player: Player) {
    const { x, y, img } = meta[id % meta.length];

    super(scene, x, y, 'ladder');
    this.id = id;
    this.player = player;
    this.scale = 0.5;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setPushable(false);
  }

  onInteract(keys: { [key: string]: Phaser.Input.Keyboard.Key }) {
    if ((this.id === 0 && keys.DOWN.isDown) || (this.id === 1 && keys.UP.isDown)) {
      const { x, y } = meta[(this.id + 1) % meta.length];
      this.player.x = x;
      this.player.y = y;

      return true;
    }

    return false;
  }
}
