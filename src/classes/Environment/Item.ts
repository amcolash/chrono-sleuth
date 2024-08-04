import { GameObjects, Math as PhaserMath, Physics, Scene } from 'phaser';

import { Config } from '../../config';
import { itemDialogs } from '../../data/dialog';
import { ItemData } from '../../data/item';
import { Layer } from '../../data/layers';
import { InteractResult, Interactive, ItemType } from '../../data/types';
import { DebugLight } from '../Debug/DebugLight';
import { Player } from '../Player/Player';
import { Key } from '../UI/InputManager';

export class Item extends Physics.Arcade.Image implements Interactive {
  itemType: ItemType;
  player: Player;
  particles: GameObjects.Particles.ParticleEmitter;
  light: GameObjects.Light | DebugLight;

  initialized: boolean = false;

  constructor(scene: Scene, type: ItemType, player: Player) {
    const { x, y, image } = ItemData[type];

    super(scene, x, y, image);

    this.itemType = type;
    this.player = player;
  }

  init() {
    const { x, y } = ItemData[this.itemType];

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    if (Config.debug) this.setInteractive({ draggable: true });

    this.setScale(0.35).setDepth(Layer.Items).setPipeline('Light2D');

    this.particles = this.scene.add.particles(x, y, 'warp', {
      scale: { start: 0, end: 0.9 },
      alpha: { start: 0.8, end: 0 },
      delay: 500,
      lifespan: 1500,
      maxAliveParticles: 1,
    });

    if (Config.debug) {
      this.light = new DebugLight(this.scene, this.x, this.y, 150 * (this.displayHeight / 150), 0xffccaa, 2);
    } else {
      this.light = this.scene.lights.addLight(this.x, this.y, 150 * (this.displayHeight / 150), 0xffccaa, 2);
    }

    console.log('creating item', ItemType[this.itemType]);
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
    this.particles?.destroy();

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

  update() {
    if (!this.initialized && this.visible && PhaserMath.Distance.BetweenPointsSquared(this, this.player) < 1000 ** 2) {
      this.init();
      this.initialized = true;
    }
  }
}
