import { GameObjects, Scene } from 'phaser';

import { Config } from '../../config';
import { Dialog } from '../../data/dialog';
import { Layer } from '../../data/layers';
import { NPCData } from '../../data/npc';
import { Game } from '../../scenes/Game';
import { Colors, getColorNumber } from '../../utils/colors';
import { fontStyle } from '../../utils/fonts';
import { NPC } from '../Environment/NPC';
import { Player } from '../Player/Player';
import { Button } from './Button';
import { ButtonGroup } from './ButtonGroup';

const padding = 20;
const boxHeight = 170;
const portraitOffset = 150;
const nameOffset = 40;
const maxLines = 5;

const timeout = 350;

export class Message extends GameObjects.Container {
  textWidth: number;
  textHeight: number;

  player: Player;
  target?: any;
  npcName: GameObjects.Text;
  text: GameObjects.Text;
  box: GameObjects.Rectangle;
  portrait: GameObjects.Image;

  options?: string[];
  optionsContainer: ButtonGroup;

  dialog?: Dialog<any>;
  messageIndex: number;
  interactionTimeout: number;

  initialized: boolean = false;

  constructor(scene: Scene, player: Player) {
    super(scene);

    // Pull these values into constructor, so they are always up to date
    const { width, height } = Config;
    this.textWidth = width - 135 - padding * 4;
    this.textHeight = boxHeight - padding * 2;

    this.setScrollFactor(0);
    this.setPosition(padding, height - padding - boxHeight);
    this.setDepth(Layer.Overlay);
    this.setVisible(false);

    this.player = player;

    this.scene.input.keyboard?.on('keydown-ENTER', () => {
      if (!this.options) this.updateDialog();
    });

    this.scene.input.keyboard?.on('keydown-BACKSPACE', () => {
      if (!this.options) this.updateDialog();
    });
  }

  createUI() {
    this.scene.add.existing(this);

    this.npcName = new GameObjects.Text(this.scene, padding + portraitOffset, padding - 5, '', {
      ...fontStyle,
      color: '#' + Colors.Tan,
    });

    this.text = new GameObjects.Text(this.scene, padding + portraitOffset, padding + nameOffset, '', fontStyle);
    this.text.width = this.textWidth;
    this.text.height = this.textHeight;

    this.text.setOrigin(0).setMaxLines(maxLines);

    this.portrait = new GameObjects.Image(this.scene, padding, padding, '').setOrigin(0).setScale(1.5);

    this.box = new GameObjects.Rectangle(
      this.scene,
      0,
      0,
      Config.width - padding * 2,
      boxHeight,
      getColorNumber(Colors.Black),
      0.8
    );
    this.box.setStrokeStyle(2, getColorNumber(Colors.Tan), 1);
    this.box.setOrigin(0, 0);

    this.optionsContainer = new ButtonGroup(this.scene).setDepth(Layer.Overlay);

    this.add([this.box, this.npcName, this.text, this.portrait]);
  }

  setDialog<T>(dialog?: Dialog<T>, target?: T, portrait?: string) {
    if (!this.npcName) this.createUI();

    this.setVisible(dialog !== undefined);

    this.target = target;
    this.messageIndex = 0;
    this.dialog = dialog;
    this.interactionTimeout = Date.now() + timeout;

    (this.scene as Game).gamepad.offsetButtons(this.dialog !== undefined);

    if (!dialog) {
      return;
    }

    this.npcName.setVisible(false);

    if (!target && !portrait) {
      this.portrait.setVisible(false);
      this.text
        .setPosition(padding, padding)
        .setWordWrapWidth(padding + portraitOffset + this.textWidth, true)
        .setFixedSize(padding + portraitOffset + this.textWidth, this.textHeight);
    } else {
      this.portrait.setVisible(true);

      this.text
        .setPosition(padding + portraitOffset, padding + (target instanceof NPC ? nameOffset : 0))
        .setWordWrapWidth(this.textWidth, true)
        .setFixedSize(this.textWidth, this.textHeight);

      if (target instanceof NPC) {
        this.npcName.setVisible(true);
        this.npcName.setText(NPCData[target.npcType].name);
        this.portrait.setTexture(NPCData[target.npcType].portrait);
      } else if (portrait) this.portrait.setTexture(portrait);
    }

    this.showMessage();
  }

  showMessage() {
    const messages = this.getMessages();
    const message = messages && messages[this.messageIndex];

    if (message) {
      this.text.setText(message);
      if (this.text.getWrappedText().length > maxLines) console.error('Message too long!', message);
    }

    this.updateOptions();
  }

  updateOptions() {
    this.optionsContainer.clearButtons();

    this.options = this.getOptions();
    if (!this.options) return;

    const tall = !Config.zoomed;

    this.options.forEach((option, index) => {
      const text = new Button(
        this.scene,
        Config.width / 2,
        Config.height / (tall ? 9 : 14) + index * (30 + Config.height / (tall ? 16 : 22)),
        option,
        () => this.onSelectOption(option),
        {
          fontSize: 24,
          backgroundColor: '#' + Colors.Black,
          padding: { y: 10 },
          align: 'center',
          fixedWidth: 350,
        }
      )
        .setOrigin(0.5)
        .setDepth(Layer.Overlay);

      this.optionsContainer.addButton(text);
    });
  }

  onSelectOption(option: string) {
    if (this.dialog?.onSelected) {
      this.dialog.onSelected(option, this.player, this.target);
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
        this.dialog.onCompleted(this.player, this.target);
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
