import { Types } from 'phaser';

import { NPC } from '../classes/Environment/NPC';
import { Game } from '../scenes/Game';
import { updateSphinxWallAndWarp } from '../utils/cutscene';
import { isNighttime } from '../utils/lighting';
import { DataProps, NPCType } from './types';

type PositionData = {
  pos: Types.Math.Vector2Like;
  condition: (target: NPC) => boolean;
  onMove?: (target: NPC) => void;
};

export const nighttimeVillager: PositionData = {
  pos: { x: 0, y: 0 },
  condition: (target) => isNighttime(target.scene),
};

export type Data = DataProps<NPC> & {
  image: string;
  portrait: string;
  light?: number;
  positionData?: PositionData[];
};

export const NPCData: Record<NPCType, Data> = {
  [NPCType.Inventor]: {
    x: 550,
    y: 635,
    scale: 0.75,
    image: 'inventor',
    portrait: 'inventor_portrait',
    name: 'Johan the Inventor',
    positionData: [nighttimeVillager],
  },
  [NPCType.Stranger]: {
    x: 1340,
    y: 1500,
    scale: 1.35,
    image: 'stranger',
    portrait: 'stranger_portrait',
    name: 'Mysterious Stranger',
  },
  [NPCType.Sphinx]: {
    x: 3520,
    y: 790,
    scale: 1,
    image: 'sphinx',
    portrait: 'sphinx_portrait',
    name: 'Mystical Sphinx',
    light: 1.85,
    positionData: [
      {
        // Position after sphinx allows player to pass
        pos: { x: 3720, y: 700 },
        condition: (sphinx) => (sphinx.scene as Game).player.gameState.data.sphinxMoved,
        onMove: (sphinx) => updateSphinxWallAndWarp(sphinx.scene, true),
      },
      {
        // Duplicated default position - used to trigger updateSphinxWallAndWarp
        pos: { x: 3520, y: 790 },
        condition: () => true,
        onMove: (sphinx) => updateSphinxWallAndWarp(sphinx.scene, false),
      },
    ],
  },
  [NPCType.Mayor]: {
    x: 790,
    y: -340,
    scale: 0.9,
    image: 'mayor',
    portrait: 'mayor_portrait',
    name: 'Joleen the Mayor',
    positionData: [nighttimeVillager],
  },
  [NPCType.Innkeeper]: {
    x: 2300,
    y: -1240,
    scale: 1.1,
    image: 'innkeeper',
    portrait: 'innkeeper_portrait',
    name: 'Bart the Innkeeper',
    skipLighting: true,
  },
  [NPCType.Baker]: {
    x: 1836,
    y: -1205,
    scale: 0.85,
    image: 'baker',
    portrait: 'baker_portrait',
    name: 'Amanda the Baker',
    skipLighting: true,
    positionData: [
      { condition: (baker) => (baker.scene as Game).player.gameState.data.day > 1, pos: { x: 2380, y: -320 } },
      nighttimeVillager,
    ],
  },
};
