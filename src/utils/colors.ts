import { Display, Scene, Tweens, Types } from 'phaser';

export const Colors = {
  White: 'fcfee9',
  Tan: 'e6c99d',
  Peach: 'd07151',
  Brown: '473946',
  Slate: '303646',
  Teal: '008080',
  Black: '1c1831',

  Warning: '993333',
  Success: '339933',

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

export function tweenColor(
  scene: Scene,
  start: Display.Color,
  end: Display.Color,
  onChange: (color: number) => void,
  config: Types.Tweens.NumberTweenBuilderConfig
): Tweens.Tween {
  const frames = (config.duration || 100) * 0.3;

  return scene.tweens.addCounter({
    from: 0,
    to: frames,
    onUpdate: (tween) => {
      const tweenedColor = Display.Color.Interpolate.ColorWithColor(start, end, frames, tween.getValue());
      onChange(colorToNumber(tweenedColor));
    },
    ...config,
  });
}
