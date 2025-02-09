import { GameObjects, Scene, Tweens } from 'phaser';

import { Config } from '../../config';
import { Dialog } from '../../data/dialog';
import { Layer } from '../../data/layers';
import { NPCData } from '../../data/npc';
import { PropData } from '../../data/prop';
import { DefaultVoice, NPCVoiceData, PlayerVoice, PropVoiceData } from '../../data/voices';
import { Game } from '../../scenes/Game';
import { Colors, getColorNumber } from '../../utils/colors';
import { fontStyle } from '../../utils/fonts';
import { animateText, playMessageAudio } from '../../utils/message';
import { NPC } from '../Environment/NPC';
import { Prop } from '../Environment/Prop';
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
  arrow: GameObjects.Image;
  arrowTween: Tweens.Tween;

  options?: string[];
  optionsContainer: ButtonGroup;

  dialog?: Dialog<any>;
  messageIndex: number;
  interactionTimeout: number;

  initialized: boolean = false;

  animating: boolean = false;
  stopAnimation?: () => void;
  stopAudio?: () => void;

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
      .rectangle(0, 0, Config.width - padding * 2, boxHeight, getColorNumber(Colors.Black), 0.9)
      .setStrokeStyle(2, getColorNumber(Colors.Tan), 1)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        if (!this.options) this.updateDialog();
      });

    this.optionsContainer = new ButtonGroup(this.scene).setDepth(Layer.Overlay);

    this.arrow = this.scene.add.image(Config.width - padding * 2 - 20, boxHeight - 22, 'chevron-down').setScale(0.5);
    this.arrowTween = this.scene.tweens.add({
      targets: this.arrow,
      y: boxHeight - 16,
      duration: 700,
      ease: 'Sine.easeIn',
      yoyo: true,
      repeat: -1,
    });

    this.add([box, this.npcName, this.text, this.portrait, this.arrow]);
  }

  setDialog<T>(dialog?: Dialog<T>, target?: T, portrait?: string) {
    if (!this.npcName) this.createUI();

    if (this.animating) {
      this.stopAudio?.();
      this.stopAnimation?.();
      this.animating = false;
      this.resetArrow();
    }

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

    (this.scene as Game).gamepad?.setAlpha(this.dialog ? 0 : 1);

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

      let name;
      if (target instanceof NPC) {
        name = NPCData[(target as NPC).npcType].name;
      } else if (target instanceof Prop) {
        name = PropData[(target as Prop).propType].name;
      }

      if (name) {
        this.npcName.setVisible(true);
        this.npcName.setText(name);
      }

      this.text
        .setPosition(padding + portraitOffset, padding + (name ? nameOffset : 0))
        .setWordWrapWidth(this.textWidth, true)
        .setFixedSize(this.textWidth, this.textHeight);
    }

    this.showMessage();
  }

  showMessage() {
    const messages = this.getMessages();
    const message = messages && messages[this.messageIndex];

    this.arrow.setAlpha(0);

    if (message) {
      this.text.setText(message);

      let voice;

      if (this.portrait?.texture.key === 'player_portrait') voice = PlayerVoice;
      if (this.target instanceof NPC) voice = NPCVoiceData[(this.target as NPC).npcType];
      if (this.target instanceof Prop) voice = PropVoiceData[(this.target as Prop).propType];
      if (!voice) voice = DefaultVoice;

      const { promise: audioPromise, stop: stopAudio } = playMessageAudio(
        message,
        voice,
        this.scene.sound.mute ? 0 : this.scene.sound.volume,
        this.scene
      );
      const { promise: textPromise, stop: stopAnimation } = animateText(this.text);

      this.animating = true;
      this.stopAudio = stopAudio;
      this.stopAnimation = stopAnimation;

      Promise.all([audioPromise, textPromise]).then(() => {
        this.animating = false;
        this.stopAudio = undefined;
        this.stopAnimation = undefined;
        this.resetArrow();
      });

      if (this.text.getWrappedText().length > maxLines) console.error('Message too long!', message);
    }

    this.updateOptions();
  }

  updateOptions() {
    this.optionsContainer.clearButtons();

    this.options = this.getOptions();
    if (!this.options) return;

    this.arrowTween.stop();
    this.arrow.setAlpha(0);

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

    if (this.animating) {
      this.stopAudio?.();
      this.stopAnimation?.();
      this.animating = false;
      this.resetArrow();

      return;
    }

    this.scene.sound.playAudioSprite('sfx', 'button', { volume: 0.7 });
    this.messageIndex++;
    this.text.setText('');

    if (this.dialog.onMessageShown) this.dialog.onMessageShown(this.player, this.messageIndex, this.target);

    if (this.messageIndex >= messages.length) {
      if (this.dialog.onCompleted) {
        this.dialog.onCompleted(this.player, this.target);
      }
      this.dialog = undefined;

      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        duration: fadeDuration,
        onComplete: () => this.setVisible(false),
      });

      (this.scene as Game).gamepad?.resetButtons();
    } else {
      // Wait a brief moment before showing the next message
      this.scene.time.delayedCall(150, () => this.showMessage());
    }

    (this.scene as Game).gamepad?.setAlpha(this.dialog === undefined ? 1 : 0);

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

  resetArrow(): void {
    if (!this.arrowTween.isDestroyed()) this.arrowTween.restart();
    this.scene.tweens.add({
      targets: this.arrow,
      alpha: 1,
      duration: 500,
    });
  }
}
