interface Data {
  x: number;
  y: number;
  width: number;
  height: number;
  flip?: boolean;
  upwards?: boolean;
}

export const SlopeData: Data[] = [
  // Clock
  { x: 740, y: -1370, width: 170, height: 95 },
  { x: 815, y: -2010, width: 90, height: 70 },

  // Lake
  { x: 5150, y: 953, width: 100, height: 60, flip: true },

  // Mansion
  { x: -1300, y: -415, width: 90, height: 35 },

  // Alchemy Lab
  { x: -710, y: 1577, width: 280, height: 190, upwards: true },
  { x: -20, y: 1697, width: 200, height: 70 },
  { x: -1570, y: 1728, width: 200, height: 40, flip: true },
];
