import { GameObjects, Scene } from 'phaser';

import { Config } from '../../config';
import { Game } from '../../scenes/Game';
import { Colors, getColorNumber } from '../../utils/colors';
import { NPCDialog } from '../../utils/dialog';
import { fontStyle } from '../../utils/fonts';
import { NPC, NPCData } from '../NPC';
import { Player } from '../Player';
import { Button } from './Button';
import { ButtonGroup } from './ButtonGroup';

const padding = 20;
const boxHeight = 170;
const portraitOffset = 150;
const nameOffset = 40;

const { width, height } = Config;
const textWidth = width - 130 - padding * 4;
const textHeight = boxHeight - padding * 2;

const timeout = 350;

export class Message extends GameObjects.Container {
  player: Player;
  npc?: NPC;
  npcName: GameObjects.Text;
  text: GameObjects.Text;
  box: GameObjects.Rectangle;
  image: GameObjects.Image;

  options?: string[];
  optionsContainer: ButtonGroup;

  dialog?: NPCDialog;
  messageIndex: number;
  interactionTimeout: number;

  constructor(scene: Scene, player: Player) {
    super(scene);
    scene.add.existing(this);

    this.setScrollFactor(0);
    this.setPosition(padding, height - padding - boxHeight);
    this.setDepth(3);
    this.setVisible(false);

    this.player = player;

    this.npcName = new GameObjects.Text(scene, padding + portraitOffset, padding - 5, '', {
      ...fontStyle,
      color: '#' + Colors.Tan,
    });

    this.text = new GameObjects.Text(scene, padding + portraitOffset, padding + nameOffset, '', fontStyle);
    this.text.width = textWidth;
    this.text.height = textHeight;

    this.text.setOrigin(0).setMaxLines(3);

    this.image = new GameObjects.Image(scene, padding, padding, '').setOrigin(0).setScale(1.5);

    this.box = new GameObjects.Rectangle(
      scene,
      0,
      0,
      width - padding * 2,
      boxHeight,
      getColorNumber(Colors.Black),
      0.8
    );
    this.box.setStrokeStyle(2, getColorNumber(Colors.Tan), 1);
    this.box.setOrigin(0, 0);

    this.optionsContainer = new ButtonGroup(scene);

    this.add([this.box, this.npcName, this.text, this.image]);

    this.scene.input.keyboard?.on('keydown-ENTER', () => {
      if (!this.options) this.updateDialog();
    });

    this.scene.input.keyboard?.on('keydown-BACKSPACE', () => {
      if (!this.options) this.updateDialog();
    });
  }

  setDialog(dialog?: NPCDialog, npc?: NPC, textureKey?: string) {
    this.setVisible(dialog !== undefined);

    this.npc = npc;
    this.messageIndex = 0;
    this.dialog = dialog;
    this.interactionTimeout = Date.now() + timeout;

    (this.scene as Game).gamepad.offsetButtons(this.dialog !== undefined);

    if (!dialog) {
      return;
    }

    this.npcName.setVisible(false);

    if (!npc && !textureKey) {
      this.image.setVisible(false);
      this.text
        .setPosition(padding, padding)
        .setWordWrapWidth(padding + portraitOffset + textWidth, true)
        .setFixedSize(padding + portraitOffset + textWidth, textHeight);
    } else {
      if (npc) {
        this.npcName.setVisible(true);
        this.npcName.setText(NPCData[npc.npcType].name);
      }

      this.image.setVisible(true);
      if (npc) this.image.setTexture(NPCData[npc.npcType].portrait);
      else if (textureKey) this.image.setTexture(textureKey);

      this.text
        .setPosition(padding + portraitOffset, padding + (npc ? nameOffset : 0))
        .setWordWrapWidth(textWidth, true)
        .setFixedSize(textWidth, textHeight);
    }

    this.showMessage();
  }

  showMessage() {
    const messages = this.getMessages();
    const message = messages && messages[this.messageIndex];

    if (message) {
      this.text.setText(message);
      if (this.text.getWrappedText().length > 3) console.error('Message too long!', message);
    }

    this.updateOptions();
  }

  updateOptions() {
    this.optionsContainer.clearButtons();

    this.options = this.getOptions();
    if (!this.options) return;

    this.options.forEach((option, index) => {
      const text = new Button(
        this.scene,
        Config.width / 2,
        120 + index * 74,
        option,
        () => this.onSelectOption(option),
        {
          fontSize: 24,
          backgroundColor: '#' + Colors.Black,
          padding: { y: 10 },
          align: 'center',
          fixedWidth: 350,
        }
      ).setOrigin(0.5);

      this.optionsContainer.addButton(text);
    });
  }

  onSelectOption(option: string) {
    if (this.dialog?.onSelected) {
      this.dialog.onSelected(option, this.player, this.npc);
      this.optionsContainer.removeAll(true);
    }
  }

  updateDialog() {
    if (Date.now() < this.interactionTimeout) return;

    const messages = this.getMessages();
    if (!this.dialog || !messages) {
      return;
    }

    this.messageIndex++;
    if (this.messageIndex >= messages.length) {
      if (this.dialog.onCompleted) {
        this.dialog.onCompleted(this.player, this.npc);
      }
      this.dialog = undefined;
      this.setVisible(false);
    } else {
      this.showMessage();
    }

    (this.scene as Game).gamepad.offsetButtons(this.dialog !== undefined);

    this.interactionTimeout = Date.now() + timeout;
  }

  getMessages(): string[] | undefined {
    let messages = this.dialog?.messages;
    if (typeof messages === 'function') {
      messages = messages(this.player);
    }
    return messages;
  }

  getOptions(): string[] | undefined {
    let options = this.dialog?.options;
    if (typeof options === 'function') {
      options = options(this.player);
    }
    return options;
  }
}
