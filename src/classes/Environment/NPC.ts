import { GameObjects, Math, Physics, Scene } from 'phaser';

import { Config } from '../../config';
import { NPCDialogs, getDialog } from '../../data/dialog';
import { Layer } from '../../data/layers';
import { Data, NPCData } from '../../data/npc';
import { InteractResult, Interactive, LazyInitialize, NPCType } from '../../data/types';
import { initializeObject } from '../../utils/interactionUtils';
import { isDaytime } from '../../utils/lighting';
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

  disabled: boolean = false;
  initialized: boolean = false;

  constructor(scene: Scene, npcType: NPCType, player: Player) {
    const { x, y, image } = NPCData[npcType] as Data;

    super(scene, x, y, image);
    this.npcType = npcType;
    this.player = player;

    this.setDepth(Layer.Npcs);
    if (image === 'warp') this.setAlpha(0);

    initializeObject(this, NPCData[npcType]);
  }

  lazyInit(forceInit?: boolean) {
    if (!forceInit && (this.initialized || !shouldInitialize(this, this.player))) return;

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    if (Config.debug) this.setInteractive({ draggable: true });

    const { x, y, light, particles, onCreate } = NPCData[this.npcType] as Data;

    const intensity = light || 1;
    const night = !isDaytime(this.scene);
    if (Config.debug) {
      this.light = new DebugLight(this.scene, this.x, this.y, 150 * (this.displayHeight / 150), 0xffccaa, intensity);
      this.light.light.setVisible(night);
    } else {
      this.light = this.scene.lights.addLight(this.x, this.y, 150 * (this.displayHeight / 150), 0xffccaa, intensity);
      this.light.setVisible(night);
    }

    if (particles) {
      this.particles = this.scene.add.particles(x, y, '', particles);
    }

    // TODO: Clock tower should likely be a Prop instead of an NPC
    if (this.npcType === NPCType.ClockTower) {
      this.clock = new ClockHands(this.scene, this.player);
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
      const dialog = getDialog<NPC>(dialogs, this.player, this);

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
