import { Config } from '../config';
import { NPCDialog, getDialog } from '../utils/dialog';
import { Player } from './Player';
import { InteractResult, Interactive, NPCType } from './types';

export const NPCData = {
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
  dialog: NPCDialog;
  messageIndex: number = 0;
  interactionTimeout: number = 500;

  constructor(scene: Phaser.Scene, npcType: NPCType, player: Player) {
    const { x, y, img, scale } = NPCData[npcType];

    super(scene, x, y, img);
    this.npcType = npcType;
    this.player = player;
    this.scale = scale;

    if (npcType === NPCType.ClockTower) {
      // this.setSize(100, 100);
    }

    scene.add.existing(this);
    scene.physics.add.existing(this);
    if (Config.debug) this.setInteractive({ draggable: true });
  }

  onInteract(keys: { [key: string]: Phaser.Input.Keyboard.Key }) {
    if (keys.SPACE.isDown || keys.ENTER.isDown) {
      // debugger;
      const dialog = getDialog(this.npcType, this.player);
      if (!dialog) {
        return InteractResult.None;
      }

      if (this.dialog !== dialog) {
        this.dialog = dialog;
        this.messageIndex = 0;
      }

      const message = dialog.messages[this.messageIndex];

      if (message) {
        const showPortrait = NPCData[this.npcType].portrait.length > 0;
        this.player.message.setMessage(message, showPortrait ? this.npcType : undefined);
      } else {
        this.player.message.setMessage();
        if (dialog.onCompleted) {
          dialog.onCompleted(this.player);
        }
      }

      this.messageIndex = (this.messageIndex + 1) % (dialog.messages.length + 1);

      return InteractResult.Talked;
    }

    return InteractResult.None;
  }

  getButtonPrompt() {
    if (this.npcType === NPCType.ClockTower) return ['Inspect Clock Tower', 'Press [CONTINUE]'];
    return [`Talk to ${NPCData[this.npcType].name}`, 'Press [CONTINUE]'];
  }
}
