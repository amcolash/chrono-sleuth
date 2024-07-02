import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { Paused } from './scenes/Paused';
import { Preloader } from './scenes/Preloader';

import { Game, Types } from 'phaser';
import { Colors } from './utils/colors';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  parent: 'game-container',
  backgroundColor: Colors.Teal,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [Boot, Preloader, MainGame, Paused],
  physics: {
    default: 'arcade',
    arcade: {
      // debug: true,
    },
  },
};

export default new Game(config);
