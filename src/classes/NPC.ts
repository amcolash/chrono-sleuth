import { Player } from './Player';
import { Interactive, InteractResult } from './types.';

const meta = [
  { x: 550, y: 635, scale: 0.75, img: 'inventor', messages: ['Are you new around Here?', 'My name is Johan and I am an inventor.'] },
  { x: 750, y: 865, scale: 1.35, img: 'stranger', messages: ['Who am I?', 'Eventually, you will learn.'] },
];

export class NPC extends Phaser.Physics.Arcade.Sprite implements Interactive {
  id: number;
  player: Player;
  messageIndex: number = 0;
  interactionTimeout: number = 500;

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
      const message = meta[this.id].messages[this.messageIndex];

      if (message) {
        this.player.setMessage(meta[this.id].messages[this.messageIndex], this.id);
      } else {
        this.player.setMessage();
      }

      this.messageIndex = (this.messageIndex + 1) % (meta[this.id].messages.length + 1);

      return InteractResult.Talked;
    }

    return InteractResult.None;
  }
}
