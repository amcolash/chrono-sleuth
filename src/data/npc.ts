import { NPC } from '../classes/Environment/NPC';
import { Game } from '../scenes/Game';
import { updateSphinx } from '../utils/cutscene';
import { isNighttime } from '../utils/lighting';
import { DataProps, NPCType } from './types';

type PositionData = {
  x: number;
  y: number;
  condition: (target: NPC) => boolean;
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
    positionData: [
      {
        x: 0,
        y: 0,
        condition: (target) => isNighttime(target.scene),
      },
    ],
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
    onCreate: (obj) => updateSphinx(obj.scene, (obj.scene as Game).player.gameState.data.sphinxMoved, true),
    light: 1.85,
    positionData: [
      {
        x: 3720,
        y: 700,
        condition: (sphinx) => {
          return (sphinx.scene as Game).player.gameState.data.sphinxMoved;
        },
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
    positionData: [
      {
        x: 0,
        y: 0,
        condition: (target) => isNighttime(target.scene),
      },
    ],
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
      {
        x: 0,
        y: 0,
        condition: (target) => isNighttime(target.scene),
      },
    ],
  },
};
