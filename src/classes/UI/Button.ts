import { GameObjects } from 'phaser';

import { Colors } from '../../utils/colors';
import { fontStyle } from '../../utils/fonts';

export class Button extends GameObjects.Text {
  constructor(scene: Phaser.Scene, x: number, y: number, text: string, onClick: () => void) {
    super(scene, x, y, text, {
      ...fontStyle,
      fontSize: 48,
      backgroundColor: `#${Colors.Teal}`,
      padding: { x: 15, y: 10 },
    });
    this.setOrigin(0.5);

    scene.add.existing(this);

    // Button interactions
    this.setInteractive();
    this.on('pointerdown', () => onClick());
    this.on('pointerover', () => this.setTint(0xbbbbbb));
    this.on('pointerout', () => this.setTint(0xffffff));
  }
}
