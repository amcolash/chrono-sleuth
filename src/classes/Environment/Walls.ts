import { Physics, Scene } from 'phaser';

import { Config } from '../../config';
import { WallData } from '../../data/wall';

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
