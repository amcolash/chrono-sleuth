import { Game, Types } from 'phaser';

import { Config } from './config';
import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { Preloader } from './scenes/Preloader';
import { DebugTool } from './scenes/dialogs/DebugTool';
import { JournalDialog } from './scenes/dialogs/JournalDialog';
import { Maze } from './scenes/dialogs/Maze';
import { MazeDialog } from './scenes/dialogs/MazeDialog';
import { Paused } from './scenes/dialogs/Paused';
import { Pipes } from './scenes/dialogs/Pipes';
import { PipesDialog } from './scenes/dialogs/PipesDialog';
import { Colors, getColorNumber } from './utils/colors';
import { loadFont } from './utils/fonts';

// SW injection is done build-time in vite config

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
  scene: [Boot, Preloader, MainGame, Paused, JournalDialog, MazeDialog, Maze, PipesDialog, Pipes, DebugTool],
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
loadFont('m6x11', './m6x11.ttf').then(() => {
  new Game(config);
});
