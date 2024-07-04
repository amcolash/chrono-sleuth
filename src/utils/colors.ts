export const Colors = {
  White: 'fcfee9',
  Tan: 'e6c99d',
  Peach: 'd07151',
  Brown: '473946',
  Teal: '303646',
  Black: '1c1831',
};

export function getColorNumber(color: string): number {
  return Phaser.Display.Color.HexStringToColor(color).color;
}
