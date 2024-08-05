import { GameObjects, Math, Physics, Scene } from 'phaser';

import { Config } from '../../config';
import { NPCDialogs, getDialog } from '../../data/dialog';
import { Layer } from '../../data/layers';
import { Data, NPCData } from '../../data/npc';
import { InteractResult, Interactive, LazyInitialize, NPCType } from '../../data/types';
import { shouldInitialize } from '../../utils/util';
import { DebugLight } from '../Debug/DebugLight';
import { ClockHands } from '../Environment/ClockHands';
import { Player } from '../Player/Player';
import { Key } from '../UI/InputManager';

export class NPC extends Physics.Arcade.Image implements Interactive, LazyInitialize {
  npcType: NPCType;
  player: Player;
  light: GameObjects.Light | DebugLight;
  particles: GameObjects.Particles.ParticleEmitter;
  lastPos: Math.Vector2 = new Math.Vector2();

  clock?: ClockHands;

  initialized: boolean = false;

  constructor(scene: Scene, npcType: NPCType, player: Player) {
    const { x, y, img, scale, initOnStart } = NPCData[npcType] as Data;

    super(scene, x, y, img);
    this.setScale(scale).setDepth(Layer.Npcs).setPipeline('Light2D');

    this.npcType = npcType;
    this.player = player;

    if (img === 'warp') this.setAlpha(0);
    if (initOnStart) this.lazyInit(true);
  }

  lazyInit(forceInit?: boolean) {
    if (!forceInit && (this.initialized || !shouldInitialize(this, this.player))) return;

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    if (Config.debug) this.setInteractive({ draggable: true });

    const { x, y, light, particles, onCreate } = NPCData[this.npcType] as Data;

    if (Config.debug) {
      this.light = new DebugLight(this.scene, this.x, this.y, 150 * (this.displayHeight / 150), 0xffccaa, light || 1);
    } else {
      this.light = this.scene.lights.addLight(this.x, this.y, 150 * (this.displayHeight / 150), 0xffccaa, light || 1);
    }

    if (particles) {
      this.particles = this.scene.add.particles(x, y, '', particles);
    }

    if (this.npcType === NPCType.ClockTower) {
      this.clock = new ClockHands(this.scene);
    }

    if (onCreate) onCreate(this);

    this.initialized = true;
  }

  update(time: number, _delta: number): void {
    this.lazyInit();

    if (this.light && (this.x !== this.lastPos.x || this.y !== this.lastPos.y)) {
      this.light.setPosition(this.x, this.y);
    }
    this.lastPos.set(this.x, this.y);

    if (this.clock) this.clock.update(time);
  }

  onInteract(keys: Record<Key, boolean>): InteractResult {
    if (this.player.message.visible || Date.now() < this.player.message.interactionTimeout) return InteractResult.None;

    if (keys[Key.Continue]) {
      const dialogs = NPCDialogs[this.npcType];
      const dialog = getDialog<NPC>(dialogs, this.player);

      if (dialog) {
        const showPortrait = NPCData[this.npcType].portrait.length > 0;
        this.player.message.setDialog<NPC>(dialog, showPortrait ? this : undefined);

        return InteractResult.Talked;
      }
    }

    return InteractResult.None;
  }

  getButtonPrompt() {
    if (this.npcType === NPCType.ClockTower) return ['Inspect Clock Tower', 'Press [CONTINUE]'];
    return [`Talk to ${NPCData[this.npcType].name}`, 'Press [CONTINUE]'];
  }
}
