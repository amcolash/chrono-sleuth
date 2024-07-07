import { Physics, Scene } from 'phaser';
import { Config } from '../config';

export class Walls extends Physics.Arcade.StaticGroup {
  constructor(scene: Scene) {
    super(scene.physics.world, scene);

    const width = 6;
    const height = 100;

    const rects = [
      // Town Ladder Top
      { x: 40, y: 600 },
      { x: 1750, y: 600 },
      // Town Ladder Bottom
      { x: 70, y: 820 },
      { x: 1650, y: 820 },
      // Forest
      { x: 2600, y: 780 },
      { x: 3650, y: 780 },
    ];

    rects.forEach((rect) => {
      const wall = scene.add.rectangle(rect.x, rect.y, width, height).setOrigin(0).setVisible(Config.debug);
      if (Config.debug) wall.setInteractive({ draggable: true });
      this.add(wall);
    });
  }
}
