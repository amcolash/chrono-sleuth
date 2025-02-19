import { Background } from '../classes/Environment/Background';
import { DataProps, Location } from './types';

export type Data = DataProps<Background> & {
  image: string;
  scale?: number; // only allow uniform scaling
  location: Location;
};

export const BackgroundData: Data[] = [
  { x: 45, y: 0, image: 'town', location: Location.Town, scale: 2 },
  { x: 500, y: -1100, image: 'clock_outside', location: Location.ClockOutside, scale: 2 },
  { x: 500, y: -2400, image: 'clock_inner', location: Location.ClockInner, scale: 2, skipLighting: true },
  { x: 2300, y: 0, image: 'forest', location: Location.Forest, scale: 2 },
  { x: 4400, y: 100, image: 'lake', location: Location.Lake, scale: 2 },
  { x: -2200, y: -170, image: 'mansion_outside', location: Location.MansionOutside, scale: 2 },
  { x: -2000, y: -1320, image: 'mansion_inside', location: Location.MansionInside, scale: 2 },
  { x: -3200, y: 1300, image: 'alchemy_lab', location: Location.AlchemyLab, scale: 1.8, skipLighting: true },
  { x: 1490, y: -860, image: 'library', location: Location.Library, scale: 2, skipLighting: true },
  { x: 1600, y: -1850, image: 'inn', location: Location.Inn, scale: 2, skipLighting: true },
  { x: 320, y: 1050, image: 'station', location: Location.Station, scale: 3 },
  { x: 3450, y: -940, image: 'town_hall', location: Location.TownHall, scale: 2, skipLighting: true },
];
