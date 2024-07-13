import { Game, Types } from 'phaser';

import { Config } from './config';
import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { JournalDialog } from './scenes/JournalDialog';
import { Paused } from './scenes/Paused';
import { Preloader } from './scenes/Preloader';
import { loadFont } from './utils/fonts';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: Config.width,
  height: Config.height,
  parent: 'game-container',
  backgroundColor: 0x111111,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [Boot, Preloader, MainGame, Paused, JournalDialog],
  physics: {
    default: 'arcade',
    arcade: {
      debug: Config.debug,
    },
  },
  render: {
    pixelArt: true,
    antialias: false,
  },
};

// TODO: Should this be in preload?
loadFont('m5x7', 'assets/m5x7.ttf').then(() => {
  new Game(config);
});
