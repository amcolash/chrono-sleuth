import { GameObjects } from 'phaser';

import { warpTo } from '../../classes/Environment/Warp';
import { Player } from '../../classes/Player/Player';
import { Config } from '../../config';
import { WarpType } from '../../data/types';
import { Game } from '../Game';
import { Dialog } from './Dialog';

// TODO: Consider rewinding during the maze if necessary
export class MazeDialog extends Dialog {
  player: Player;
  arrow: GameObjects.Image;

  constructor() {
    super({ key: 'MazeDialog', title: 'Find your way through the forest', childScene: 'Maze', gamepadVisible: true });
  }

  init(data: { player: Player }) {
    this.player = data.player;
    this.dialogData.gamepadVisible = (data.player.scene as Game)?.gamepad?.visible;

    this.load.image('arrow', 'puzzles/arrow.png');
  }

  create() {
    super.create();

    this.arrow = this.add
      .image(-Config.width * 0.4, -Config.height * 0.4, 'arrow')
      .setScale(0.5)
      .setRotation(Math.PI * 0.75);
    this.container.add(this.arrow);
  }

  setAngle(angle: number) {
    this.arrow.setRotation(angle + Math.PI / 2);
  }

  handleSuccess(success: boolean): void {
    if (success) {
      warpTo(WarpType.TownEast, WarpType.Forest, this.player);
      this.player.gameState.updateData({ mazeSolved: true, mazeSeed: this.player.gameState.data.mazeSeed + 1 }, false);
    }
  }
}
