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
const fadeDuration = 125;

export class Message extends GameObjects.Container {
  textWidth: number;
  textHeight: number;

  player: Player;
  target?: any;
  npcName: GameObjects.Text;
  text: GameObjects.Text;
  portrait: GameObjects.Image;

  options?: string[];
  optionsContainer: ButtonGroup;

  dialog?: Dialog<any>;
  messageIndex: number;
  interactionTimeout: number;

  gamepadVisible: boolean = false;
  initialized: boolean = false;

  constructor(scene: Scene, player?: Player) {
    super(scene);

    // Pull these values into constructor, so they are always up to date
    const { width, height } = Config;
    this.textWidth = width - 135 - padding * 4;
    this.textHeight = boxHeight - padding * 2;

    this.setScrollFactor(0);
    this.setPosition(padding, height - padding - boxHeight);
    this.setDepth(Layer.Overlay);
    this.setAlpha(0);
    this.setVisible(false);

    // Player is not necessary to show basic dialog, but might crash on complex dialogs
    if (player) this.player = player;

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

    this.text = this.scene.add.text(padding + portraitOffset, padding + nameOffset, '', fontStyle);
    this.text.width = this.textWidth;
    this.text.height = this.textHeight;

    this.text.setOrigin(0).setMaxLines(maxLines);

    this.portrait = this.scene.add.image(padding, padding, '').setOrigin(0).setScale(1.5);

    const box = this.scene.add
      .rectangle(0, 0, Config.width - padding * 2, boxHeight, getColorNumber(Colors.Black), 0.8)
      .setStrokeStyle(2, getColorNumber(Colors.Tan), 1)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        if (!this.options) this.updateDialog();
      });

    this.optionsContainer = new ButtonGroup(this.scene).setDepth(Layer.Overlay);

    const arrow = this.scene.add.image(Config.width - padding * 2 - 20, boxHeight - 16, 'chevron-down').setScale(0.5);
    this.scene.tweens.add({
      targets: arrow,
      y: boxHeight - 22,
      scale: 0.4,
      duration: 1000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    this.add([box, this.npcName, this.text, this.portrait, arrow]);
  }

  setDialog<T>(dialog?: Dialog<T>, target?: T, portrait?: string) {
    if (!this.npcName) this.createUI();
    this.gamepadVisible = (this.scene as Game).gamepad?.visible || false;

    this.setVisible(true);
    this.scene.tweens.add({
      targets: this,
      alpha: dialog !== undefined ? 1 : 0,
      duration: fadeDuration,
      onComplete: () => this.setVisible(dialog !== undefined),
    });

    this.target = target;
    this.messageIndex = 0;
    this.dialog = dialog;
    this.interactionTimeout = Date.now() + timeout;

    (this.scene as Game).gamepad?.setVisible(this.dialog === undefined ? this.gamepadVisible : false);

    if (!dialog) {
      return;
    }

    const finalPortrait = portrait || (target instanceof NPC ? NPCData[(target as NPC).npcType].portrait : undefined);

    this.npcName.setVisible(false);

    if (!finalPortrait) {
      this.portrait.setVisible(false);
      this.text
        .setPosition(padding, padding)
        .setWordWrapWidth(padding + portraitOffset + this.textWidth, true)
        .setFixedSize(padding + portraitOffset + this.textWidth, this.textHeight);
    } else {
      this.portrait.setVisible(true);
      this.portrait.setTexture(finalPortrait);

      this.text
        .setPosition(padding + portraitOffset, padding + (target instanceof NPC ? nameOffset : 0))
        .setWordWrapWidth(this.textWidth, true)
        .setFixedSize(this.textWidth, this.textHeight);

      if (target instanceof NPC) {
        this.npcName.setVisible(true);
        this.npcName.setText(NPCData[target.npcType].name);
      }
    }

    this.showMessage();
  }

  showMessage() {
    const messages = this.getMessages();
    const message = messages && messages[this.messageIndex];

    if (message) {
      this.scene.tweens.add({
        targets: this.text,
        alpha: 0,
        duration: fadeDuration,
        onComplete: () => {
          this.text.setText(message);
          this.scene.tweens.add({
            targets: this.text,
            alpha: 1,
            duration: fadeDuration,
          });
        },
      });

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
      this.text.setText('');

      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        duration: fadeDuration,
        onComplete: () => this.setVisible(false),
      });

      (this.scene as Game).gamepad?.resetButtons();
    } else {
      this.showMessage();
    }

    (this.scene as Game).gamepad?.setVisible(this.dialog === undefined ? this.gamepadVisible : false);

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
