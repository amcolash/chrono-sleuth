import { GameObjects } from 'phaser';

import { Config } from '../../config';
import { itemDialogs } from '../../data/dialog';
import { ItemData } from '../../data/item';
import { Layer } from '../../data/layers';
import { InteractResult, Interactive, ItemType } from '../../data/types';
import { DebugLight } from '../Debug/DebugLight';
import { Player } from '../Player/Player';
import { Key } from '../UI/InputManager';

export class Item extends Phaser.Physics.Arcade.Image implements Interactive {
  itemType: ItemType;
  player: Player;
  particles: GameObjects.Particles.ParticleEmitter;
  light: GameObjects.Light | DebugLight;

  constructor(scene: Phaser.Scene, type: ItemType, player: Player) {
    const { x, y, image } = ItemData[type];

    super(scene, x, y, image);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    if (Config.debug) this.setInteractive({ draggable: true });

    this.setScale(0.35).setDepth(Layer.Items).setPipeline('Light2D');

    this.itemType = type;
    this.player = player;

    this.particles = scene.add.particles(x, y, 'warp', {
      scale: { start: 0, end: 0.9 },
      alpha: { start: 0.8, end: 0 },
      delay: 500,
      lifespan: 1500,
      maxAliveParticles: 1,
    });

    if (Config.debug) {
      this.light = new DebugLight(scene, this.x, this.y, 150 * (this.displayHeight / 150), 0xffccaa, 2);
    } else {
      this.light = scene.lights.addLight(this.x, this.y, 150 * (this.displayHeight / 150), 0xffccaa, 2);
    }
  }

  onInteract(keys: Record<Key, boolean>): InteractResult {
    if (keys[Key.Continue]) {
      this.player.inventory.addItem(this.itemType);
      this.handleSideEffects();
      this.destroy();

      return InteractResult.Item;
    }

    return InteractResult.None;
  }

  destroy(fromScene?: boolean): void {
    this.particles.destroy();

    if (this.light instanceof DebugLight) this.light.destroy();
    else this.scene?.lights?.removeLight(this.light);

    super.destroy(fromScene);
  }

  getButtonPrompt() {
    return [`Pick Up ${ItemType[this.itemType]}`, 'Press [CONTINUE]'];
  }

  handleSideEffects() {
    const dialog = itemDialogs[this.itemType];
    if (dialog) this.player.message.setDialog(dialog, undefined, 'player_portrait');
  }
}
