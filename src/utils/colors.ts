import { Display, Types } from 'phaser';

export const Colors = {
  White: 'fcfee9',
  Tan: 'e6c99d',
  Peach: 'd07151',
  Brown: '473946',
  Teal: '303646',
  Black: '1c1831',

  Warning: '993333',

  Lights: 'ffccaa',
  Night: '335588',

  Background: '111111',
  ButtonActive: 'ddaaee',
};

export function getColorNumber(color: string): number {
  return Display.Color.HexStringToColor(color).color;
}

export function fromRGB(color: Display.RGB): number {
  return getColorNumber(Display.Color.RGBToString(color.r * 255, color.g * 255, color.b * 255));
}

export function colorToNumber(color: Types.Display.ColorObject): number {
  return getColorNumber(Display.Color.RGBToString(color.r, color.g, color.b));
}

export function getColorObject(color: number): Display.Color {
  const rgba = Display.Color.ColorToRGBA(color);
  return new Display.Color(rgba.r, rgba.g, rgba.b, rgba.a);
}
