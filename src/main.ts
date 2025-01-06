import { Game, Types } from 'phaser';

import { Config } from './config';
import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { Intro } from './scenes/Intro';
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
import { CRTPipeline, PipelinePlugin } from './utils/shaders/crt';
import { XRayPipeline } from './utils/shaders/xray';
import { createStats } from './utils/stats';
import { setupCursorHiding } from './utils/util';

// SW injection is done build-time in vite config

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  width: Config.width,
  height: Config.height,
  parent: 'game-container',
  backgroundColor: getColorNumber(Colors.Background),
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Config.prod ? Phaser.Scale.CENTER_BOTH : Phaser.Scale.CENTER_HORIZONTALLY,
  },
  loader: { imageLoadType: 'HTMLImageElement' },
  scene: [
    Boot,
    MainMenu,
    Preloader,

    Intro,
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
  pipeline: { CRTPipeline, XRayPipeline },
  input: {
    gamepad: true,
  },
  disableContextMenu: Config.prod,
  physics: {
    default: 'arcade',
  },
  fps: {
    // limit: 60,
    panicMax: 165,
    smoothStep: true,
  },
  render: {
    pixelArt: true,
    antialias: false,
  },
  dom: {
    createContainer: true,
  },
  plugins: {
    // Inject CRT pipeline into every scene created
    scene: [{ key: 'PipelinePlugin', plugin: PipelinePlugin, mapping: 'pipelinePlugin' }],
  },
};

setupCursorHiding();

const loading = document.querySelector('#initial-loader');
loading?.remove();

const game = new Game(config);

// Only create stats in dev mode
if (!Config.prod || Config.debug) createStats(game);
