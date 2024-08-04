import { PropType } from './types';

interface Data {
  x: number;
  y: number;
  image: string;
  portrait?: string;
}

export const propData: Record<PropType, Data> = {
  [PropType.LabBook]: {
    x: 300,
    y: 1630,
    image: 'book',
  },
  [PropType.AlchemySet]: {
    x: -1000,
    y: 1630,
    image: 'alchemy_empty',
  },
};
