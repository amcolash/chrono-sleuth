import { GameObjects } from 'phaser';

import { fontStyle } from '../../utils/fonts';

export class Button extends GameObjects.Text {
  constructor(scene: Phaser.Scene, x: number, y: number, text: string, onClick: () => void) {
    super(scene, x, y, text, { ...fontStyle, fontSize: 48, backgroundColor: '#05a', padding: { x: 15, y: 10 } });
    this.setOrigin(0.5);

    scene.add.existing(this);

    // Button interactions
    this.setInteractive();
    this.on('pointerdown', () => onClick());
    this.on('pointerover', () => this.setBackgroundColor('#06e'));
    this.on('pointerout', () => this.setBackgroundColor('#05a'));
  }
}
