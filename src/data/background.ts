import { DataProps } from './types';

export type Data = DataProps & {
  image: string;
  scale?: number; // only allow uniform scaling
};

export const BackgroundData: Data[] = [
  { x: 0, y: 0, image: 'town' },
  { x: 500, y: -1100, image: 'clock_outside' },
  { x: 500, y: -2400, image: 'clock_inner', skipLighting: true },
  { x: 2300, y: 0, image: 'forest' },
  { x: 4400, y: 100, image: 'lake' },
  { x: -2200, y: -170, image: 'mansion_outside' },
  { x: -2000, y: -1320, image: 'mansion_inside', skipLighting: true },
  { x: -3200, y: 1300, image: 'alchemy_lab', scale: 0.9, skipLighting: true },
  { x: 1500, y: -700, image: 'library', skipLighting: true },
];
