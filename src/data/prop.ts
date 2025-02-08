import { Prop } from '../classes/Environment/Prop';
import { DataProps, PropType } from './types';

type Data = DataProps<Prop> & {
  portrait?: string;
};

export const PropData: Record<PropType, Data> = {
  [PropType.ClockTower]: {
    x: 880,
    y: -2090,
    scale: 0.5,
    name: 'Clock Tower',
    portrait: 'clock_portrait',
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
  [PropType.Chest]: {
    x: 4955,
    y: 915,
    image: 'chest',
    scale: { x: 4.5, y: 3 },
  },
  [PropType.LabHatch]: {
    x: -1910,
    y: 640,
    name: 'Trap Door',
  },
  [PropType.LabBook]: {
    x: -700,
    y: 1630,
    name: 'Journal',
    image: 'book',
    skipLighting: true,
  },
  [PropType.AlchemySet]: {
    x: -2650,
    y: 1600,
    image: 'alchemy_empty',
    initializeOnStart: true,
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
  [PropType.LabBookshelf1]: {
    x: -2025,
    y: 1700,
    name: 'Bookshelf',
  },
  [PropType.LabBookshelf2]: {
    x: -1290,
    y: 1700,
    name: 'Bookshelf',
  },
  [PropType.LabBookshelf3]: {
    x: -1115,
    y: 1700,
    name: 'Bookshelf',
  },
  [PropType.LabPotionShelf1]: {
    x: -1790,
    y: 1700,
    name: 'Potion Shelf',
  },
  [PropType.MansionPicture]: {
    x: -1233,
    y: -580,
    scale: 1.2,
    angle: 5,
    name: 'Picture',
    image: 'picture',
    origin: { x: 0, y: 0 },
    initializeOnStart: true,
  },
  [PropType.MansionHole]: {
    x: -1870,
    y: -490,
    name: 'Hole in the Wall',
  },
  [PropType.Bed]: {
    x: 2670,
    y: -1530,
    scale: { x: 7, y: 2 },
  },
  [PropType.InnSign]: {
    x: 1350,
    y: 450,
    image: 'inn_sign',
    scale: 0.2,
  },
  [PropType.TrainSign]: {
    x: 235,
    y: 555,
    image: 'train_sign',
    scale: 0.2,
  },
};
