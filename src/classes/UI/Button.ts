import { GameObjects, Scene, Types } from 'phaser';

import { Colors, getColorNumber } from '../../utils/colors';
import { fontStyle } from '../../utils/fonts';

export class Button extends GameObjects.Text {
  onClick: (button: Button) => void;
  disabled: boolean;
  selected: boolean;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    text: string,
    onClick: (button: Button) => void,
    style?: Types.GameObjects.Text.TextStyle
  ) {
    super(scene, x, y, text, {
      ...fontStyle,
      fontSize: 48,
      backgroundColor: `#${Colors.Slate}`,
      padding: { x: 15, y: 10 },
      ...style,
    });
    this.setOrigin(0.5);

    scene.add.existing(this);

    this.onClick = () => {
      if (!this.disabled) {
        scene.sound.playAudioSprite('sfx', 'button');
        this.setSelected(false);
        onClick(this);
      }
    };

    this.disabled = false;
    this.selected = false;

    // Button interactions
    this.setInteractive({ useHandCursor: true }).setScrollFactor(0);

    this.on('pointerdown', () => {
      this.onClick(this);
    });
    this.on('pointerover', () => {
      if (!this.disabled && !this.selected) this.setTint(0xbbbbbb);
    });
    this.on('pointerout', () => {
      if (!this.disabled && !this.selected) this.setTint(0xffffff);
    });
  }

  disable() {
    this.disabled = true;
    this.selected = false;
    this.disableInteractive();
    this.setTint(0x666666);
  }

  enable() {
    this.disabled = false;
    this.selected = false;
    this.setInteractive();
    this.setTint(0xffffff);
  }

  setSelected(selected: boolean) {
    this.selected = selected;
    this.setTint(selected ? getColorNumber(Colors.ButtonActive) : 0xffffff);
  }
}

export class CenteredButton extends Button {
  constructor(
    scene: Scene,
    x: number,
    y: number,
    text: string,
    onClick: (button: Button) => void,
    style?: Types.GameObjects.Text.TextStyle,
    size?: Types.Math.Vector2Like | null,
    origin?: Types.Math.Vector2Like
  ) {
    super(scene, x, y, text, onClick, { fontSize: 32, align: 'center', ...style });

    this.setOrigin(origin?.x || 0, origin?.y || 0);
    if (size !== null) this.setFixedSize(size?.x || 250, size?.y || 50);
  }
}
