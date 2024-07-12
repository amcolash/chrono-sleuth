import { Config } from '../config';
import { Player } from './Player';
import { InteractResult, Interactive, ItemType } from './types';

export const ItemData = {
  [ItemType.Book]: { x: 1500, y: 875, image: 'book' },
  [ItemType.Map]: { x: 3500, y: 810, image: 'map' },
};

export class Item extends Phaser.Physics.Arcade.Sprite implements Interactive {
  itemType: ItemType;
  player: Player;

  constructor(scene: Phaser.Scene, type: ItemType, player: Player) {
    const { x, y, image } = ItemData[type];

    super(scene, x, y, image);
    this.itemType = type;
    this.player = player;
    this.scale = 0.35;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    if (Config.debug) this.setInteractive({ draggable: true });

    scene.add.particles(x, y, 'warp', {
      speed: { min: 2, max: 10 },
      scale: { start: 0.1, end: 0.9 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 500,
      frequency: 1000,
    });
  }

  onInteract(keys: { [key: string]: Phaser.Input.Keyboard.Key }) {
    if (keys.SPACE.isDown || keys.ENTER.isDown) {
      this.player.inventory.addItem(this.itemType);
      this.destroy();
      return InteractResult.Item;
    }

    return InteractResult.None;
  }

  getButtonPrompt() {
    return [`Pick Up ${ItemType[this.itemType]}`, 'Press [CONTINUE]'];
  }
}
