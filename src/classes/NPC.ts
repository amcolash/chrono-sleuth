import { GameObjects, Math, Types } from 'phaser';

import { Config } from '../config';
import { getDialog } from '../utils/dialog';
import { updateSphinx } from '../utils/interactionUtils';
import { Layer } from '../utils/layers';
import { ClockHands } from './ClockHands';
import { DebugLight } from './DebugLight';
import { Key } from './InputManager';
import { Player } from './Player';
import { InteractResult, Interactive, NPCType } from './types';

type Data = {
  x: number;
  y: number;
  scale: number;
  img: string;
  portrait: string;
  name: string;
  onCreate?: (npc: NPC) => void;
  light?: number;
  particles?: Types.GameObjects.Particles.ParticleEmitterConfig;
};

export const NPCData: Record<NPCType, Data> = {
  [NPCType.Inventor]: {
    x: 550,
    y: 635,
    scale: 0.75,
    img: 'inventor',
    portrait: 'inventor_portrait',
    name: 'Johan the Inventor',
  },
  [NPCType.Stranger]: {
    x: 750,
    y: 865,
    scale: 1.35,
    img: 'stranger',
    portrait: 'stranger_portrait',
    name: 'Mysterious Stranger',
  },
  [NPCType.Sphinx]: {
    x: 3520,
    y: 790,
    scale: 1,
    img: 'sphinx',
    portrait: 'sphinx_portrait',
    name: 'Mystical Sphinx',
    onCreate: (npc) => updateSphinx(npc.scene, false),
    light: 1.85,
  },
  [NPCType.Mayor]: {
    x: 1065,
    y: -340,
    scale: 0.9,
    img: 'mayor',
    portrait: 'mayor_portrait',
    name: 'Mayor of Town',
  },

  [NPCType.ClockTower]: {
    x: 880,
    y: -2090,
    scale: 0.5,
    img: 'warp',
    portrait: 'clock_portrait',
    name: 'Clock Tower',
    particles: {
      texture: 'warp',
      scale: { start: 0, end: 1.1 },
      alpha: { start: 1, end: 0 },
      lifespan: 2000,
      delay: 1000,
      maxAliveParticles: 1,
      tint: [0xc76350],
    },
  },
};

export class NPC extends Phaser.Physics.Arcade.Sprite implements Interactive {
  npcType: NPCType;
  player: Player;
  light: GameObjects.Light | DebugLight;
  particles: GameObjects.Particles.ParticleEmitter;
  lastPos: Math.Vector2 = new Math.Vector2();
  clock?: ClockHands;

  constructor(scene: Phaser.Scene, npcType: NPCType, player: Player) {
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
