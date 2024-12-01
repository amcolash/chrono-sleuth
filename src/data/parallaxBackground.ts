import { Types } from 'phaser';

export type Data = {
  position: Types.Math.Vector2Like;
  size: Types.Math.Vector2Like;
  scale?: number;
  images: {
    texture: string;
    scale?: number;
    speed: number;
  }[];
  skipLighting?: boolean;
};

export const ParallaxBackgroundData: Data[] = [
  // {
  //   position: { x: 0, y: 0 },
  //   size: { x: 1920, y: 1080 },
  //   scale: 3.5,
  //   images: [
  //     {
  //       texture: 'layer5',
  //       speed: 0,
  //     },
  //     {
  //       texture: 'layer4',
  //       speed: 0.01,
  //     },
  //     {
  //       texture: 'layer3',
  //       speed: 0.02,
  //     },
  //     {
  //       texture: 'layer2',
  //       speed: 0.03,
  //     },
  //   ],
  // },
];
