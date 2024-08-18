import { GameObjects, Scene, Types } from 'phaser';

import { Colors } from '../../utils/colors';
import { fontStyle } from '../../utils/fonts';

export class Button extends GameObjects.Text {
  onClick: () => void;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    text: string,
    onClick: () => void,
    style?: Types.GameObjects.Text.TextStyle
  ) {
    super(scene, x, y, text, {
      ...fontStyle,
      fontSize: 48,
      backgroundColor: `#${Colors.Teal}`,
      padding: { x: 15, y: 10 },
      ...style,
    });
    this.setOrigin(0.5);

    scene.add.existing(this);

    this.onClick = onClick;

    // Button interactions
    this.setInteractive({ useHandCursor: true }).setScrollFactor(0);
    this.on('pointerdown', () => onClick());
    this.on('pointerover', () => this.setTint(0xbbbbbb));
    this.on('pointerout', () => this.setTint(0xffffff));
  }
}

export class CenteredButton extends Button {
  constructor(
    scene: Scene,
    x: number,
    y: number,
    text: string,
    onClick: () => void,
    style?: Types.GameObjects.Text.TextStyle,
    size?: Types.Math.Vector2Like | null
  ) {
    super(scene, x, y, text, onClick, { fontSize: 32, align: 'center', ...style });
    this.setOrigin(0);

    if (size !== null) this.setFixedSize(size?.x || 250, size?.y || 50);
  }
}
