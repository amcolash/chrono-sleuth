import { GameObjects, Scene } from 'phaser';

import { Player } from '../classes/Player';
import { Button } from '../classes/UI/Button';
import { WarpData, warp } from '../classes/Warp';
import { WarpType } from '../classes/types';
import { Config } from '../config';
import { Colors, getColorNumber } from '../utils/colors';
import { fontStyle } from '../utils/fonts';

// TODO: Consider rewinding during the maze if necessary
export class MazeDialog extends Scene {
  player: Player;
  container: GameObjects.Container;
  arrow: GameObjects.Sprite;

  constructor() {
    super('MazeDialog');
  }

  init(data: { player: Player }) {
    this.player = data.player;
  }

  create() {
    this.container = this.add.container(Config.width / 2, Config.height / 2);

    this.container.add(
      this.add
        .rectangle(0, 0, Config.width * 0.95, Config.height * 0.95, 0x000000, 0.9)
        .setStrokeStyle(4, getColorNumber(Colors.Tan))
    );
    this.container.add(new Button(this, Config.width * 0.4, Config.height * -0.4, 'Close', () => this.close(false)));

    this.container.add(
      this.add
        .text(0, Config.height * -0.4, 'Find your way through the forest', { ...fontStyle, fontSize: 48 })
        .setOrigin(0.5)
    );

    this.arrow = this.add
      .sprite(-Config.width * 0.4, -Config.height * 0.4, 'arrow')
      .setScale(0.5)
      .setRotation(Math.PI * 0.75);
    this.container.add(this.arrow);

    this.input.keyboard?.on('keydown-ESC', () => {
      this.close(false);
    });

    this.scene.launch('Maze', { parent: this });
  }

  setAngle(angle: number) {
    this.arrow.setRotation(angle + Math.PI / 2);
  }

  close(success: boolean) {
    this.scene.stop();
    this.scene.stop('Maze');

    this.scene.resume('Game');

    if (success) {
      warp(WarpType.Forest, this.player);
    } else {
      this.player.setPosition(WarpData[WarpType.TownEast].x - 40, WarpData[WarpType.TownEast].y);
    }
  }
}
