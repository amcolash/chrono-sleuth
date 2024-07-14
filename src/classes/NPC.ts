import { Config } from '../config';
import { getDialog } from '../utils/dialog';
import { updateSphinx } from '../utils/interactionUtils';
import { Player } from './Player';
import { InteractResult, Interactive, NPCType } from './types';

type Data = {
  x: number;
  y: number;
  scale: number;
  img: string;
  portrait: string;
  name: string;
  onCreate?: (npc: NPC) => void;
};

export const NPCData: Record<NPCType, Data> = {
  [NPCType.Inventor]: {
    x: 550,
    y: 635,
    scale: 0.75,
    img: 'inventor',
    portrait: 'inventor_portrait',
    name: 'Johan the Inventor',
  },
  [NPCType.Stranger]: {
    x: 750,
    y: 865,
    scale: 1.35,
    img: 'stranger',
    portrait: 'stranger_portrait',
    name: 'Mysterious Stranger',
  },
  [NPCType.Sphinx]: {
    x: 3520,
    y: 780,
    scale: 1,
    img: 'sphinx',
    portrait: 'sphinx_portrait',
    name: 'Mystical Sphinx',
    onCreate: updateSphinx,
  },
  [NPCType.Mayor]: {
    x: 1065,
    y: -340,
    scale: 0.9,
    img: 'mayor',
    portrait: 'mayor_portrait',
    name: 'Mayor of Town',
  },

  [NPCType.ClockTower]: {
    x: 880,
    y: -2090,
    scale: 0.7,
    img: 'warp',
    portrait: '',
    name: 'Clock Tower',
  },
};

export class NPC extends Phaser.Physics.Arcade.Sprite implements Interactive {
  npcType: NPCType;
  player: Player;

  constructor(scene: Phaser.Scene, npcType: NPCType, player: Player) {
    const { x, y, img, scale, onCreate } = NPCData[npcType] as Data;

    super(scene, x, y, img);
    this.npcType = npcType;
    this.player = player;
    this.scale = scale;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    if (Config.debug) this.setInteractive({ draggable: true });

    if (onCreate) onCreate(this);
  }

  onInteract(keys: { [key: string]: Phaser.Input.Keyboard.Key }) {
    if (this.player.message.visible || Date.now() < this.player.message.interactionTimeout) return InteractResult.None;

    if (keys.SPACE.isDown || keys.ENTER.isDown) {
      const dialog = getDialog(this.npcType, this.player);
      if (!dialog) {
        return InteractResult.None;
      }

      const showPortrait = NPCData[this.npcType].portrait.length > 0;
      this.player.message.setDialog(dialog, showPortrait ? this : undefined);

      return InteractResult.Talked;
    }

    return InteractResult.None;
  }

  getButtonPrompt() {
    if (this.npcType === NPCType.ClockTower) return ['Inspect Clock Tower', 'Press [CONTINUE]'];
    return [`Talk to ${NPCData[this.npcType].name}`, 'Press [CONTINUE]'];
  }
}
