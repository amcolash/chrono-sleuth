import { WallType } from './types';

export interface Data {
  x: number;
  y: number;
  id?: WallType;
}

export const WallData: Data[] = [
  // Town Surface
  { x: 40, y: 600 },
  { x: 1750, y: 600 },

  // Town Underground
  { x: 90, y: 820 },
  { x: 1650, y: 820 },

  // Clock Outside
  { x: 550, y: -400 },
  { x: 1150, y: -400 },

  // Clock Inside
  { x: 640, y: -1380 },
  { x: 930, y: -1470 },
  { x: 740, y: -2050 },
  { x: 930, y: -2115 },

  // Forest
  { x: 2600, y: 760 },
  { x: 3630, y: 760, id: WallType.Sphinx },

  // Lake
  { x: 4575, y: 850 },
  { x: 6160, y: 690 },

  // Mansion Outside
  { x: -565, y: 575 },
  { x: -2075, y: 575 },

  // Mansion Inside

  // Alchemy Lab
  { x: -2075, y: 1630 },
  { x: -350, y: 1510 },
  { x: 270, y: 1560 },
];
