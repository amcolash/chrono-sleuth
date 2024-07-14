import { GameObjects, Scene } from 'phaser';

import { Config } from '../../config';
import { Colors, getColorNumber } from '../../utils/colors';
import { NPCDialog } from '../../utils/dialog';
import { fontStyle } from '../../utils/fonts';
import { NPC, NPCData } from '../NPC';
import { Player } from '../Player';

const padding = 20;
const boxHeight = 170;
const portraitOffset = 150;
const nameOffset = 40;

const { width, height } = Config;
const textWidth = width - 120 - padding * 4;
const textHeight = boxHeight - padding * 2;

const timeout = 350;

export class Message extends GameObjects.Container {
  player: Player;
  npc?: NPC;
  npcName: GameObjects.Text;
  text: GameObjects.Text;
  box: GameObjects.Rectangle;
  image: GameObjects.Image;

  dialog?: NPCDialog;
  messageIndex: number;
  interactionTimeout: number;

  constructor(scene: Scene, player: Player) {
    super(scene);
    scene.add.existing(this);

    this.setScrollFactor(0);
    this.setPosition(padding, height - padding - boxHeight);
    this.setDepth(2);
    this.setVisible(false);

    this.player = player;

    this.npcName = new GameObjects.Text(scene, padding + portraitOffset, padding - 5, '', {
      ...fontStyle,
      color: '#' + Colors.Tan,
    });

    this.text = new GameObjects.Text(scene, padding + portraitOffset, padding + nameOffset, '', fontStyle);
    this.text.width = textWidth;
    this.text.height = textHeight;

    this.text.setOrigin(0).setWordWrapWidth(textWidth, true).setFixedSize(textWidth, textHeight);

    this.image = new GameObjects.Image(scene, padding, padding, '').setOrigin(0).setScale(1.5);

    this.box = new GameObjects.Rectangle(
      scene,
      0,
      0,
      width - padding * 2,
      boxHeight,
      getColorNumber(Colors.Black),
      0.7
    );
    this.box.setStrokeStyle(2, getColorNumber(Colors.Tan), 1);
    this.box.setOrigin(0, 0);

    this.add([this.box, this.npcName, this.text, this.image]);

    this.scene.input.keyboard?.on('keydown-ENTER', () => {
      this.updateDialog();
    });

    this.scene.input.keyboard?.on('keydown-SPACE', () => {
      this.updateDialog();
    });
  }

  setDialog(dialog?: NPCDialog, npc?: NPC) {
    this.setVisible(dialog !== undefined);

    this.npc = npc;
    this.messageIndex = 0;
    this.dialog = dialog;
    this.interactionTimeout = Date.now() + timeout;

    if (!dialog) {
      return;
    }

    if (npc === undefined) {
      this.npcName.setVisible(false);
      this.image.setVisible(false);
      this.text.setPosition(padding, padding);
    } else {
      this.npcName.setVisible(true);
      this.npcName.setText(NPCData[npc.npcType].name);

      this.image.setVisible(true);
      this.image.setTexture(NPCData[npc.npcType].portrait);

      this.text.setPosition(padding + portraitOffset, padding + nameOffset);
    }

    this.showMessage();
  }

  showMessage() {
    const messages = this.dialog?.messages;
    const message = messages && messages[this.messageIndex];

    if (message) {
      this.text.setText(message);
      if (this.text.getWrappedText().length > 2) console.error('Message too long!', message);
    }
  }

  updateDialog() {
    if (Date.now() < this.interactionTimeout) return;

    if (!this.dialog) {
      return;
    }

    this.messageIndex++;
    if (this.messageIndex >= this.dialog.messages.length) {
      if (this.dialog.onCompleted) {
        this.dialog.onCompleted(this.player, this.npc);
      }
      this.dialog = undefined;
      this.setVisible(false);
    } else {
      this.showMessage();
    }

    this.interactionTimeout = Date.now() + timeout;
  }
}
