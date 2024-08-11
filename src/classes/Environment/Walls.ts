import { Math as PhaserMath, Physics, Scene } from 'phaser';

import { Config } from '../../config';
import { WallData, Data as WallInfo } from '../../data/wall';
import { Player } from '../Player/Player';

const width = 6;
const height = 100;

export class Walls extends Physics.Arcade.StaticGroup {
  player: Player;
  initialized: number[] = [];

  constructor(scene: Scene, player: Player) {
    super(scene.physics.world, scene);

    this.player = player;

    // Only initialize walls on scene start if they have an id. Otherwise, wait until later
    WallData.forEach((wall, i) => {
      if (wall.id !== undefined) this.createWall(wall, i);
    });
  }

  createWall(data: WallInfo, index: number) {
    const wall = this.scene.add.rectangle(data.x, data.y, width, height).setOrigin(0).setVisible(Config.debug);
    if (data.id !== undefined) wall.setData('WallType', data.id);

    if (Config.debug) wall.setInteractive({ draggable: true });
    this.add(wall);
    this.initialized.push(index);
  }

  update() {
    for (let i = 0; i < WallData.length; i++) {
      if (this.initialized.includes(i)) continue;

      const wall = WallData[i];
      if (PhaserMath.Distance.BetweenPointsSquared(wall, this.player) < 1000 ** 2) this.createWall(wall, i);
    }
  }
}
