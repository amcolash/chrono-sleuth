import { GameObjects, Math, Physics, Scene } from 'phaser';

import { Config } from '../../config';
import { getDialog } from '../../data/dialog';
import { Layer } from '../../data/layers';
import { Data, NPCData } from '../../data/npc';
import { InteractResult, Interactive, NPCType } from '../../data/types';
import { DebugLight } from '../Debug/DebugLight';
import { ClockHands } from '../Environment/ClockHands';
import { Player } from '../Player/Player';
import { Key } from '../UI/InputManager';

export class NPC extends Physics.Arcade.Image implements Interactive {
  npcType: NPCType;
  player: Player;
  light: GameObjects.Light | DebugLight;
  particles: GameObjects.Particles.ParticleEmitter;
  lastPos: Math.Vector2 = new Math.Vector2();
  clock?: ClockHands;

  constructor(scene: Scene, npcType: NPCType, player: Player) {
    const { x, y, img, scale, onCreate, light, particles } = NPCData[npcType] as Data;

    super(scene, x, y, img);
    this.setScale(scale).setDepth(Layer.Npcs).setPipeline('Light2D');

    if (img === 'warp') this.setAlpha(0);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    if (Config.debug) this.setInteractive({ draggable: true });

    if (Config.debug) {
      this.light = new DebugLight(scene, this.x, this.y, 150 * (this.displayHeight / 150), 0xffccaa, light || 1);
    } else {
      this.light = scene.lights.addLight(this.x, this.y, 150 * (this.displayHeight / 150), 0xffccaa, light || 1);
    }

    this.npcType = npcType;
    this.player = player;

    if (particles) {
      this.particles = scene.add.particles(x, y, '', particles);
    }

    if (npcType === NPCType.ClockTower) {
      this.clock = new ClockHands(scene);
    }

    if (onCreate) onCreate(this);
  }

  update(time: number, _delta: number): void {
    if (this.x !== this.lastPos.x || this.y !== this.lastPos.y) {
      this.light.setPosition(this.x, this.y);
    }

    this.lastPos.set(this.x, this.y);
    if (this.clock) this.clock.update(time);
  }

  onInteract(keys: Record<Key, boolean>): InteractResult {
    if (this.player.message.visible || Date.now() < this.player.message.interactionTimeout) return InteractResult.None;

    if (keys[Key.Continue]) {
      const dialog = getDialog(this.npcType, this.player);
      if (!dialog) {
        return InteractResult.None;
      }

      const showPortrait = NPCData[this.npcType].portrait.length > 0;
      this.player.message.setDialog(dialog, showPortrait ? this : undefined);

      return InteractResult.Talked;
    }

    return InteractResult.None;
  }

  getButtonPrompt() {
    if (this.npcType === NPCType.ClockTower) return ['Inspect Clock Tower', 'Press [CONTINUE]'];
    return [`Talk to ${NPCData[this.npcType].name}`, 'Press [CONTINUE]'];
  }
}
