interface Data {
  x: number;
  y: number;
  image: string;
  skipLighting?: boolean;
}

export const backgroundData: Data[] = [
  { x: 0, y: 0, image: 'town' },
  { x: 500, y: -1100, image: 'clock_outside' },
  { x: 500, y: -2400, image: 'clock_inner', skipLighting: true },
  { x: 2300, y: 0, image: 'forest' },
  { x: 4400, y: 100, image: 'lake' },
];
