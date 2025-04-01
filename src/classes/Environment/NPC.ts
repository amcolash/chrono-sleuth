import { GameObjects, Physics, Scene, Time } from 'phaser';

import { Config } from '../../config';
import { NPCDialogs, getDialog } from '../../data/dialog';
import { Layer } from '../../data/layers';
import { Data, NPCData } from '../../data/npc';
import { InteractResult, Interactive, LazyInitialize, NPCType } from '../../data/types';
import { initializeObject } from '../../utils/interactionUtils';
import { isDaytime, isNighttime } from '../../utils/lighting';
import { gameInitialized, nearby } from '../../utils/util';
import { DebugLight } from '../Debug/DebugLight';
import { Player } from '../Player/Player';
import { Key } from '../UI/InputManager';

export class NPC extends Physics.Arcade.Image implements Interactive, LazyInitialize {
  npcType: NPCType;
  npcData: Data;
  player: Player;
  light: GameObjects.Light | DebugLight;
  particles: GameObjects.Particles.ParticleEmitter;
  shadow: GameObjects.Image;
  moveTimeline?: Time.Timeline;

  disabled: boolean = false;
  initialized: boolean = false;
  debugPosition: boolean = false;

  constructor(scene: Scene, npcType: NPCType, player: Player) {
    const data = NPCData[npcType];
    const { x, y, image } = data;

    super(scene, x, y, 'characters', image);
    this.name = `NPC-${npcType}`;

    this.npcData = data;
    this.npcType = npcType;
    this.player = player;

    this.setDepth(Layer.Npcs);

    initializeObject(this, data);
  }

  lazyInit() {
    if (this.initialized || !gameInitialized(this.player)) return;

    let shouldInitialize = nearby(this, this.player, 1000);
    this.npcData.positionData?.forEach((pos) => {
      if (nearby(pos.pos, this.player, 1000)) shouldInitialize = true;
    });

    if (!shouldInitialize) return;

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    if (Config.debug) this.setInteractive({ draggable: true });

    const { x, y, light, particles, onCreate } = this.npcData;

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
      this.particles = this.scene.add
        .particles(x, y, 'props', { frame: 'warp', ...particles })
        .setName(`NPC-${this.npcType}-Particles`);
    }

    this.shadow = this.scene.add
      .image(this.x, this.y, 'props', 'warp')
      .setScale(0.75, 0.15)
      .setTint(0x000000)
      .setAlpha(0.5);

    if (onCreate) onCreate(this);
    this.initialized = true;

    this.handleMovement(true);
  }

  update(_time: number, _delta: number): void {
    this.lazyInit();
    this.handleMovement();
  }

  handleMovement(silent: boolean = false) {
    if (!this.initialized) return;

    const posData = this.npcData.positionData;

    // Don't move if already moved via debug
    if (this.debugPosition) return;

    // Update NPC position, regardless of if it is initialized. Use a smooth
    // tween + fade out/in npc
    if (posData && !this.moveTimeline) {
      const nextPos = { x: this.npcData.x, y: this.npcData.y };
      let onMove: ((target: NPC) => void) | undefined;

      for (let i = 0; i < posData.length; i++) {
        const { pos, condition } = posData[i];
        if (condition(this)) {
          nextPos.x = pos.x;
          nextPos.y = pos.y;
          onMove = posData[i].onMove;
          break;
        }
      }

      if (Math.abs(this.x - nextPos.x) > 1 || Math.abs(this.y - nextPos.y) > 1) {
        if (onMove) onMove(this);

        if (silent) {
          this.setPosition(nextPos.x, nextPos.y);
        } else {
          const originalLightValue =
            this.light instanceof DebugLight ? this.light?.light?.intensity : this.light?.intensity;

          const duration = 200;
          this.moveTimeline = this.scene.add
            .timeline([
              {
                at: 0,
                tween: {
                  targets: this,
                  alpha: 0,
                  duration,
                  onUpdate: (_tween, _target, _key, current) => this.light?.setIntensity(current * originalLightValue),
                  onComplete: () => {
                    this.light?.setVisible(false);
                    this.light?.setIntensity(originalLightValue);
                  },
                },
              },
              {
                at: duration + 100,
                tween: {
                  targets: this,
                  alpha: 1,
                  duration,
                  delay: duration,
                  onStart: () => {
                    this.light?.setIntensity(0);
                    if (isNighttime(this.scene)) this.light?.setVisible(true);
                  },
                  onUpdate: (_tween, _target, _key, current) => this.light?.setIntensity(current * originalLightValue),
                },
                run: () => this.setPosition(nextPos.x, nextPos.y),
              },
            ])
            .play()
            .once('complete', () => (this.moveTimeline = undefined));
        }
      }
    }

    // Always update light/shadow position
    this.light?.setPosition(this.x, this.y);
    this.shadow?.setPosition(this.x, this.y + this.displayHeight / 2);
  }

  setPosition(x?: number, y?: number, z?: number, w?: number): this {
    super.setPosition(x, y, z, w);
    if (this.light && x && y) this.light.setPosition(x, y);
    return this;
  }

  onInteract(keys: Record<Key, boolean>): InteractResult {
    if (this.player.message.visible || Date.now() < this.player.message.interactionTimeout) return InteractResult.None;

    if (keys[Key.Continue]) {
      const dialogs = NPCDialogs[this.npcType];
      const dialog = getDialog<NPC>(dialogs, this.player, this);

      if (dialog && dialog?.messages.length > 0) {
        const showPortrait = this.npcData.portrait.length > 0;
        this.player.message.setDialog<NPC>(dialog, showPortrait ? this : undefined);

        return InteractResult.Talked;
      }
    }

    return InteractResult.None;
  }

  getButtonPrompt() {
    return [`Talk to ${this.npcData.name}`, 'Press [CONTINUE]'];
  }
}
