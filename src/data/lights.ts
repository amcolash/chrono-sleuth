import { Colors, getColorNumber } from '../utils/colors';

interface Data {
  x: number;
  y: number;
  radius?: number;
  color?: number;
  intensity?: number;
}

export const lightData: Data[] = [
  // Town square
  { x: 135, y: 462, radius: 150, color: getColorNumber(Colors.Tan), intensity: 2.5 },
  { x: 697, y: 441 },
  { x: 1018, y: 435 },
  { x: 887, y: 200, radius: 150 },
  { x: 1561, y: 460 },
  { x: 791, y: 472, intensity: 0.5 },
  { x: 962, y: 469, intensity: 0.5 },

  // Underground
  { x: 162, y: 814, intensity: 2 },
  { x: 635, y: 772 },
  { x: 1638, y: 788, intensity: 2 },

  // Lake
  { x: 5300, y: 530, intensity: 2 },
  { x: 5315, y: 730, intensity: 0.75, radius: 75 },
];
