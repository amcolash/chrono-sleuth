import { Scene } from 'phaser';
import { Config } from '../config';
import { fontStyle } from '../utils/colors';

export class Paused extends Scene {
  constructor() {
    super('Paused');
  }

  create() {
    const width = Config.width;
    const height = Config.height;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.75);

    this.add.text(width / 2, 300, 'Paused', { ...fontStyle, fontSize: 96 }).setOrigin(0.5);

    const resume = this.add
      .text(width / 2, 450, 'Resume', { ...fontStyle, fontSize: 48, backgroundColor: '#05a', padding: { x: 20, y: 20 } })
      .setOrigin(0.5);

    // Button interactions
    resume.setInteractive();
    resume.on('pointerdown', () => this.resume());
    resume.on('pointerover', () => resume.setBackgroundColor('#06e'));
    resume.on('pointerout', () => resume.setBackgroundColor('#05a'));

    // Keyboard interactions
    this.input.keyboard?.on('keydown-ESC', () => this.resume());
  }

  resume() {
    this.scene.resume('Game');
    this.scene.stop();
  }
}
