import { Display } from 'phaser';

export const Colors = {
  White: 'fcfee9',
  Tan: 'e6c99d',
  Peach: 'd07151',
  Brown: '473946',
  Teal: '303646',
  Black: '1c1831',

  Lights: 'ffccaa',
  Ambient: 'aaaaaa',
  Night: '224477',
};

export function getColorNumber(color: string): number {
  return Display.Color.HexStringToColor(color).color;
}
export function fromRGB(color: Display.RGB): number {
  return getColorNumber(Display.Color.RGBToString(color.r * 255, color.g * 255, color.b * 255));
}
