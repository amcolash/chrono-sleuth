import { GameObjects, Physics } from 'phaser';

import { Game } from '../scenes/Game';
import { sphinxWallOffset } from '../utils/cutscene';
import { WallType } from './types';

export interface Data {
  x: number;
  y: number;
  id?: WallType;
  onCreate?: (target: GameObjects.Rectangle) => void;
}

export const WallData: Data[] = [
  // Town
  { x: 40, y: 600 },
  { x: 1750, y: 600 },

  // Station
  { x: 320, y: 1300 },
  { x: 1410, y: 1450 },

  // Clock Outside
  { x: 510, y: -400 },
  { x: 1170, y: -400 },

  // Clock Inside
  { x: 640, y: -1380 },
  { x: 930, y: -1470 },
  { x: 740, y: -2050 },
  { x: 930, y: -2115 },

  // Forest
  { x: 2600, y: 760 },
  {
    x: 3610,
    y: 760,
    id: WallType.Sphinx,
    onCreate: (wall: GameObjects.Rectangle) => {
      const moved = (wall.scene as Game).player.gameState.data.sphinxMoved;
      if (!moved) wall.setX(wall.x - sphinxWallOffset);
      (wall.body as Physics.Arcade.Body)?.updateFromGameObject();
    },
  },

  // Lake
  { x: 4455, y: 850 },
  { x: 5690, y: 900 },

  // Mansion Outside
  { x: -565, y: 575 },
  { x: -2075, y: 575 },

  // Mansion Inside
  { x: -1930, y: -480 },
  { x: -1050, y: -510 },

  // Alchemy Lab
  { x: -3075, y: 1630 },
  { x: -1350, y: 1510 },
  { x: -730, y: 1560 },

  // Library
  { x: 1620, y: -350 },
  { x: 3095, y: -350 },

  // Inn
  { x: 1790, y: -1245 },
  { x: 2790, y: -1245 },
  { x: 2765, y: -1580 },
];
