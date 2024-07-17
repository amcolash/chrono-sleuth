import { GameObjects } from 'phaser';

import { Config } from '../config';
import { itemDialogs } from '../utils/dialog';
import { Player } from './Player';
import { InteractResult, Interactive, ItemType } from './types';

export const ItemData = {
  [ItemType.Wrench]: { x: 0, y: 0, image: 'wrench', name: 'Wrench' },
  [ItemType.Gear1]: { x: 5120, y: 915, image: 'gear', name: 'Gear' },
};

export class Item extends Phaser.Physics.Arcade.Sprite implements Interactive {
  itemType: ItemType;
  player: Player;
  particles: GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene, type: ItemType, player: Player) {
    const { x, y, image } = ItemData[type];

    super(scene, x, y, image);
    this.itemType = type;
    this.player = player;
    this.scale = 0.35;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    if (Config.debug) this.setInteractive({ draggable: true });

    this.particles = scene.add.particles(x, y, 'warp', {
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
      this.handleSideEffects();
      this.destroy();

      return InteractResult.Item;
    }

    return InteractResult.None;
  }

  destroy(fromScene?: boolean): void {
    super.destroy(fromScene);
    this.particles.destroy();
  }

  getButtonPrompt() {
    return [`Pick Up ${ItemType[this.itemType]}`, 'Press [CONTINUE]'];
  }

  handleSideEffects() {
    const dialog = itemDialogs[this.itemType];
    if (dialog) this.player.message.setDialog(dialog);
  }
}
