import { Scene } from 'phaser';

import { Button } from '../classes/UI/Button';
import { Config } from '../config';
import { fontStyle } from '../utils/fonts';
import { save } from '../utils/save';
import { Game } from './Game';

export class Paused extends Scene {
  parent: Game;

  constructor() {
    super('Paused');
  }

  init(data: { game: Game }) {
    this.parent = data.game;
  }

  create() {
    const width = Config.width;
    const height = Config.height;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.75);

    this.add.text(width / 2, 200, 'Game Paused', { ...fontStyle, fontSize: 72 }).setOrigin(0.5);

    new Button(this, width / 2, height / 2, 'Resume', () => this.resume());

    new Button(this, width / 2, height / 2 + 90, 'Save', () => {
      this.resume();
      save(this.parent);
    });

    new Button(this, width / 2, height / 2 + 180, 'Load', () => {
      this.resume();
      this.parent.scene.restart();
    });

    new Button(this, width / 2, height / 2 + 270, 'Toggle Gamepad', () => {
      this.parent.gamepad.setVisible(!this.parent.gamepad.visible);
    });

    // Keyboard interactions
    this.input.keyboard?.on('keydown-ESC', () => this.resume());
  }

  resume() {
    this.scene.stop();
    this.scene.resume('Game');
  }
}
