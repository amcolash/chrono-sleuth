import { Scene } from 'phaser';
import { Config } from '../config';
import { fontStyle } from '../utils/colors';
import { Button } from '../classes/UI/Button';

export class Paused extends Scene {
  constructor() {
    super('Paused');
  }

  create() {
    const width = Config.width;
    const height = Config.height;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.75);

    this.add.text(width / 2, 300, 'Game Paused', { ...fontStyle, fontSize: 72 }).setOrigin(0.5);

    new Button(this, width / 2, height / 2 + 50, 'Resume', () => this.resume());

    // Keyboard interactions
    this.input.keyboard?.on('keydown-ESC', () => this.resume());
  }

  resume() {
    this.scene.resume('Game');
    this.scene.stop();
  }
}
