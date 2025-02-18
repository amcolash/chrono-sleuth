import { SignType } from './types';

type Data = {
  x: number;
  y: number;
  text: string;
};

export const SignData: Record<SignType, Data> = {
  [SignType.Library]: {
    x: 1100,
    y: -470,
    text: 'Library',
  },
  [SignType.Inn]: {
    x: 1350,
    y: 450,
    text: 'Inn',
  },
  [SignType.Train]: {
    x: 235,
    y: 555,
    text: 'Train',
  },
};
