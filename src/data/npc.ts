import { Types } from 'phaser';

import { NPC } from '../classes/Environment/NPC';
import { updateSphinx } from '../utils/interactionUtils';
import { NPCType } from './types';

export type Data = {
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
    onCreate: (npc) => {
      npc.setOffset(150, -40);
    },
  },
};
