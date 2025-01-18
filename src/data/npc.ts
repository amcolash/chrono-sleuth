import { NPC } from '../classes/Environment/NPC';
import { Game } from '../scenes/Game';
import { updateSphinx } from './cutscene';
import { DataProps, NPCType } from './types';

export type Data = DataProps<NPC> & {
  image: string;
  portrait: string;
  name: string;
  light?: number;
};

export const NPCData: Record<NPCType, Data> = {
  [NPCType.Inventor]: {
    x: 550,
    y: 635,
    scale: 0.75,
    image: 'inventor',
    portrait: 'inventor_portrait',
    name: 'Johan the Inventor',
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
    initializeOnStart: true,
  },
  [NPCType.Mayor]: {
    x: 790,
    y: -340,
    scale: 0.9,
    image: 'mayor',
    portrait: 'mayor_portrait',
    name: 'Joleen the Mayor',
  },
  [NPCType.Innkeeper]: {
    x: 2300,
    y: -1240,
    scale: 1.1,
    image: 'innkeeper',
    portrait: 'innkeeper_portrait',
    name: 'Bart the Innkeeper',
  },
  [NPCType.Baker]: {
    x: 1836,
    y: -1205,
    scale: 0.85,
    image: 'baker',
    portrait: 'baker_portrait',
    name: 'Amanda the Baker',
  },
};
