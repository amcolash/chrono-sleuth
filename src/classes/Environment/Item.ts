import { GameObjects, Physics, Scene } from 'phaser';

import { Config } from '../../config';
import { ItemDialogs, getDialog } from '../../data/dialog';
import { ItemData } from '../../data/item';
import { Layer } from '../../data/layers';
import { InteractResult, Interactive, ItemType, LazyInitialize } from '../../data/types';
import { hasItem, initializeObject } from '../../utils/interactionUtils';
import { shouldInitialize } from '../../utils/util';
import { DebugLight } from '../Debug/DebugLight';
import { Player } from '../Player/Player';
import { Key } from '../UI/InputManager';

export class Item extends Physics.Arcade.Image implements Interactive, LazyInitialize {
  itemType: ItemType;
  player: Player;
  particles: GameObjects.Particles.ParticleEmitter;
  light: GameObjects.Light | DebugLight;

  disabled?: boolean = false;
  initialized: boolean = false;

  constructor(scene: Scene, type: ItemType, player: Player) {
    const { x, y, image } = ItemData[type];

    super(scene, x, y, 'items', image);
    this.name = `Item-${type}`;

    this.itemType = type;
    this.player = player;

    this.setScale(0.35).setDepth(Layer.Items);
    initializeObject(this, ItemData[type]);
  }

  lazyInit() {
    if (this.initialized || !shouldInitialize(this, this.player)) return;

    // Check if player already has item, if so, destroy this item
    if (hasItem(this.player, this.itemType)) {
      this.destroy();
      return;
    }

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    if (Config.debug) this.setInteractive({ draggable: true });

    this.particles = this.scene.add
      .particles(this.x, this.y, 'props', {
        frame: 'warp',
        scale: { start: 0, end: 0.9 },
        alpha: { start: 0.7, end: 0 },
        delay: 500,
        lifespan: 1500,
        maxAliveParticles: 1,
      })
      .setDepth(Layer.Items)
      .setName(`Item-${this.itemType}-Particles`);

    if (Config.debug) {
      this.light = new DebugLight(this.scene, this.x, this.y, 150 * (this.displayHeight / 150), 0xffccaa, 2);
    } else {
      this.light = this.scene.lights.addLight(this.x, this.y, 150 * (this.displayHeight / 150), 0xffccaa, 2);
    }

    const onCreate = ItemData[this.itemType].onCreate;
    if (onCreate) onCreate(this);
    this.initialized = true;
  }

  onInteract(keys: Record<Key, boolean>): InteractResult {
    if (keys[Key.Continue]) {
      // Delay adding + dialog to prevent double destroy
      this.scene.time.delayedCall(0, () => {
        this.player.inventory.addItem({ type: this.itemType, used: false });

        // Optionally show dialog if there is any when item has been picked up
        const dialogs = ItemDialogs[this.itemType] || [];
        const dialog = getDialog<Item>(dialogs, this.player, this);
        if (dialog && dialog?.messages.length > 0) this.player.message.setDialog<Item>(dialog, this, 'player_portrait');
      });

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
    return [`Pick Up ${ItemData[this.itemType].name}`, 'Press [CONTINUE]'];
  }

  update() {
    this.lazyInit();
    this.particles?.setPosition(this.x, this.y);
    this.light?.setPosition(this.x, this.y);
  }
}
