import { Physics, Scene } from 'phaser';

import { Config } from '../config';
import { WallType } from './types';

export const WallData = [
  // Town Ladder Top
  { x: 40, y: 600 },
  { x: 1750, y: 600 },

  // Town Ladder Bottom
  { x: 90, y: 820 },
  { x: 1650, y: 820 },

  // Clock Outside
  { x: 550, y: -400 },
  { x: 1150, y: -400 },

  // Clock Inside
  { x: 640, y: -1380 },
  { x: 1020, y: -1380 },
  { x: 750, y: -2075 },
  { x: 900, y: -2075 },

  // Forest
  { x: 2600, y: 760 },
  { x: 3600, y: 760, id: WallType.Sphinx },

  // Lake
  { x: 4575, y: 870 },
  { x: 5150, y: 870 },
];

export class Walls extends Physics.Arcade.StaticGroup {
  constructor(scene: Scene) {
    super(scene.physics.world, scene);

    const width = 6;
    const height = 100;

    WallData.forEach((rect) => {
      const wall = scene.add.rectangle(rect.x, rect.y, width, height).setOrigin(0).setVisible(Config.debug);
      wall.setData('WallType', rect.id);

      if (Config.debug) wall.setInteractive({ draggable: true });
      this.add(wall);
    });
  }
}
