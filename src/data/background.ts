import { DataProps, Location } from './types';

export type Data = DataProps & {
  image: string;
  scale?: number; // only allow uniform scaling
  location: Location;
};

export const BackgroundData: Data[] = [
  { x: 0, y: 0, image: 'town', location: Location.Town },
  { x: 500, y: -1100, image: 'clock_outside', location: Location.ClockOutside },
  { x: 500, y: -2400, image: 'clock_inner', location: Location.ClockInner, skipLighting: true },
  { x: 2300, y: 0, image: 'forest', location: Location.Forest },
  { x: 4400, y: 100, image: 'lake', location: Location.Lake },
  { x: -2200, y: -170, image: 'mansion_outside', location: Location.MansionOutside },
  { x: -2000, y: -1320, image: 'mansion_inside', location: Location.MansionInside, skipLighting: true },
  { x: -3200, y: 1300, image: 'alchemy_lab', location: Location.AlchemyLab, scale: 0.9, skipLighting: true },
  { x: 1600, y: -760, image: 'town_hall', location: Location.TownHall, scale: 0.75, skipLighting: true },
  { x: 1600, y: -1560, image: 'inn', location: Location.Inn, skipLighting: true },
];
