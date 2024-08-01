import { Game, Types } from 'phaser';

import { Config } from './config';
import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { JournalDialog } from './scenes/JournalDialog';
import { Maze } from './scenes/Maze';
import { MazeDialog } from './scenes/MazeDialog';
import { Paused } from './scenes/Paused';
import { Pipes } from './scenes/Pipes';
import { PipesDialog } from './scenes/PipesDialog';
import { Preloader } from './scenes/Preloader';
import { Colors, getColorNumber } from './utils/colors';
import { loadFont } from './utils/fonts';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: Config.width,
  height: Config.height,
  parent: 'game-container',
  backgroundColor: getColorNumber(Colors.Background),
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [Boot, Preloader, MainGame, Paused, JournalDialog, MazeDialog, Maze, PipesDialog, Pipes],
  input: {
    gamepad: true,
  },
  physics: {
    default: 'arcade',
  },
  render: {
    pixelArt: true,
    antialias: false,
  },
  dom: {
    createContainer: true,
  },
};

// TODO: Should this be in preload?
loadFont('m6x11', 'assets/m6x11.ttf').then(() => {
  new Game(config);
});
