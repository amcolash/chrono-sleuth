import { Player } from './Player';
import { Interactive, InteractResult } from './types.';

const meta = [
  { x: 550, y: 635, scale: 0.75, img: 'inventor', messages: ['Hi I am an inventor.', 'Nice town here.'] },
  { x: 750, y: 865, scale: 1.35, img: 'stranger', messages: ['Who am I?', 'Eventually, you will learn.'] },
];

export class NPC extends Phaser.Physics.Arcade.Sprite implements Interactive {
  id: number;
  player: Player;
  messageIndex: number;

  constructor(scene: Phaser.Scene, id: number, player: Player) {
    const { x, y, img, scale } = meta[id % meta.length];

    super(scene, x, y, img);
    this.id = id;
    this.player = player;
    this.scale = scale;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setPushable(false);
  }

  onInteract(keys: { [key: string]: Phaser.Input.Keyboard.Key }) {
    if (keys.SPACE.isDown || keys.ENTER.isDown) {
      this.messageIndex = this.messageIndex + 1;

      const message = meta[this.id].messages[this.messageIndex];
      if (message) {
        this.player.setMessage(meta[this.id].messages[this.messageIndex], this.id);
      } else {
        this.player.setMessage();
      }

      return InteractResult.Talked;
    }

    return InteractResult.None;
  }
}
