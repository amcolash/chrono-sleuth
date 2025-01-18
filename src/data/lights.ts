import { Colors, getColorNumber } from '../utils/colors';

interface Data {
  x: number;
  y: number;
  radius?: number;
  color?: number;
  intensity?: number;
}

export const LightData: Data[] = [
  // Town square
  { x: 135, y: 462, radius: 150, color: getColorNumber(Colors.Tan), intensity: 2.5 },
  { x: 697, y: 441 },
  { x: 1018, y: 435 },
  { x: 887, y: 200, radius: 150 },
  { x: 1561, y: 460 },
  { x: 791, y: 472, intensity: 0.5 },
  { x: 962, y: 469, intensity: 0.5 },
  { x: 295, y: 640 },

  // Underground (?)

  { x: 560, y: 1347 },
  { x: 658, y: 1347 },
  { x: 763, y: 1347 },
  { x: 842, y: 1347 },
  { x: 939, y: 1347 },
  { x: 1049, y: 1347 },
  { x: 1148, y: 1347 },

  { x: 639, y: 1174 },
  { x: 750, y: 1174 },
  { x: 856, y: 1174 },
  { x: 958, y: 1174 },
  { x: 1066, y: 1174 },

  // Lake
  { x: 5300, y: 530, intensity: 2 },
  { x: 5315, y: 730, intensity: 0.75, radius: 75 },
];
