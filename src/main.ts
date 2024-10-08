import { Game, Types } from 'phaser';
import { FontPlugin } from 'phaser-font-plugin';

import { Config } from './config';
import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';
import { UITest } from './scenes/UITest';
import { DebugTool } from './scenes/dialogs/DebugTool';
import { JournalDialog } from './scenes/dialogs/JournalDialog';
import { Maze } from './scenes/dialogs/Maze';
import { MazeDialog } from './scenes/dialogs/MazeDialog';
import { MemoryDialog } from './scenes/dialogs/MemoryDialog';
import { Paused } from './scenes/dialogs/Paused';
import { Pipes } from './scenes/dialogs/Pipes';
import { PipesDialog } from './scenes/dialogs/PipesDialog';
import { SliderDialog } from './scenes/dialogs/SliderDialog';
import { TumblerDialog } from './scenes/dialogs/TumblerDialog';
import { Colors, getColorNumber } from './utils/colors';

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
  scene: [
    Boot,
    MainMenu,
    Preloader,

    MainGame,

    Paused,
    JournalDialog,

    DebugTool,

    MazeDialog,
    Maze,

    PipesDialog,
    Pipes,

    TumblerDialog,

    MemoryDialog,

    SliderDialog,

    UITest,
  ],
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
  plugins: {
    global: [
      {
        key: 'FontPlugin',
        plugin: FontPlugin,
        start: true,
      },
    ],
  },
};

const loading = document.querySelector('#initial-loader');
loading?.remove();

new Game(config);
