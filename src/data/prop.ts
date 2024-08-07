import { Types } from 'phaser';

import { PropType } from './types';

interface Data {
  x: number;
  y: number;
  image?: string;
  portrait?: string;
  skipLighting?: boolean;
  particles?: Types.GameObjects.Particles.ParticleEmitterConfig;
}

export const PropData: Record<PropType, Data> = {
  [PropType.LabHatch]: {
    x: -1910,
    y: 640,
  },
  [PropType.LabBook]: {
    x: 300,
    y: 1630,
    image: 'book',
  },
  [PropType.AlchemySet]: {
    x: -1650,
    y: 1600,
    image: 'alchemy_empty',
    skipLighting: true,
    particles: {
      scale: { min: 0.05, max: 0.15 },
      speed: { min: 30, max: 120 },
      alpha: { values: [0, 0.5, 0] },
      gravityY: 100,
      lifespan: { min: 250, max: 500 },
      emitting: false,
      stopAfter: 60,
    },
  },
};
