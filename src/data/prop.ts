import { PropType } from './types';

interface Data {
  x: number;
  y: number;
  image?: string;
  portrait?: string;
  skipLighting?: boolean;
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
  },
};
