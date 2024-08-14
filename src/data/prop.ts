import { DataProps, PropType } from './types';

type Data = DataProps & {
  portrait?: string;
};

export const PropData: Record<PropType, Data> = {
  [PropType.Chest]: {
    x: 5110,
    y: 915,
    image: 'chest',
    scale: { x: 4.5, y: 3 },
  },
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
  [PropType.LabBookshelf1]: {
    x: -1025,
    y: 1700,
  },
  [PropType.LabBookshelf2]: {
    x: -290,
    y: 1700,
  },
  [PropType.LabBookshelf3]: {
    x: -115,
    y: 1700,
  },
  [PropType.LabPotionShelf1]: {
    x: -790,
    y: 1700,
  },
  [PropType.MansionPicture]: {
    x: -1233,
    y: -580,
    scale: 1.2,
    angle: 5,
    image: 'picture',
    origin: { x: 0, y: 0 },
    initializeOnStart: true,
  },
  [PropType.MansionHole]: {
    x: -1870,
    y: -490,
  },
};
