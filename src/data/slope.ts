interface Data {
  x: number;
  y: number;
  width: number;
  height: number;
  flip?: boolean;
}

export const slopeData: Data[] = [
  // Clock
  { x: 740, y: -1370, width: 170, height: 95 },
  { x: 815, y: -2010, width: 90, height: 70 },

  // Lake
  { x: 5150, y: 953, width: 100, height: 60, flip: true },
  { x: 5820, y: 795, width: 220, height: 220 },
];
