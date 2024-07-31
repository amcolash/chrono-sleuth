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
  { x: 930, y: -1470 },
  { x: 740, y: -2050 },
  { x: 930, y: -2115 },

  // Forest
  { x: 2600, y: 760 },
  { x: 3630, y: 760, id: WallType.Sphinx },

  // Lake
  { x: 4575, y: 850 },
  { x: 6160, y: 690 },
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
