import { getDialog, NPCDialog } from '../utils/dialog';
import { Player } from './Player';
import { Interactive, InteractResult, NPCType } from './types.';

const meta = {
  [NPCType.Inventor]: {
    x: 550,
    y: 635,
    scale: 0.75,
    img: 'inventor',
  },
  [NPCType.Stranger]: { x: 750, y: 865, scale: 1.35, img: 'stranger' },
};

export class NPC extends Phaser.Physics.Arcade.Sprite implements Interactive {
  npcType: NPCType;
  player: Player;
  dialog: NPCDialog;
  messageIndex: number = 0;
  interactionTimeout: number = 500;

  constructor(scene: Phaser.Scene, npcType: NPCType, player: Player) {
    const { x, y, img, scale } = meta[npcType];

    super(scene, x, y, img);
    this.npcType = npcType;
    this.player = player;
    this.scale = scale;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setPushable(false);
  }

  onInteract(keys: { [key: string]: Phaser.Input.Keyboard.Key }) {
    if (keys.SPACE.isDown || keys.ENTER.isDown) {
      // debugger;
      const dialog = getDialog(this.npcType, this.player);
      if (!dialog) {
        return InteractResult.None;
      }

      // TODO: Reset dialog index when response changes
      if (this.dialog !== dialog) {
        this.dialog = dialog;
        this.messageIndex = 0;
      }

      const message = dialog.messages[this.messageIndex];

      if (message) {
        this.player.setMessage(message, this.npcType);
      } else {
        this.player.setMessage();
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
    return 'Press CONTINUE';
  }
}
