import { exit } from '@tauri-apps/api/process';
import { Scene } from 'phaser';

import { Button } from '../../classes/UI/Button';
import { ButtonGroup } from '../../classes/UI/ButtonGroup';
import { Gamepad } from '../../classes/UI/Gamepad';
import { Config } from '../../config';
import { fontStyle } from '../../utils/fonts';
import { save } from '../../utils/save';
import { Game } from '../Game';

export class Paused extends Scene {
  parent: Game;

  constructor() {
    super('Paused');
  }

  init(data: { game: Game }) {
    this.parent = data.game;
  }

  create() {
    const { width, height } = Config;

    this.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0.75)
      .setInteractive()
      .on('pointerdown', () => this.resume());

    this.add.text(width / 2, 100, 'Game Paused', { ...fontStyle, fontSize: 72 }).setOrigin(0.5);

    if (import.meta.env.PROD) {
      this.add
        .text(width - 20, 20, `Build Time: ${new Date(__BUILD_TIME__).toLocaleString()}`, {
          ...fontStyle,
          fontSize: 16,
        })
        .setOrigin(1, 0);
    }

    const large = !Config.zoomed;
    const spacing = large ? 100 : 80;
    const fontSize = large ? 48 : 36;
    const start = large ? 220 : 180;

    const buttonGroup = new ButtonGroup(this);

    buttonGroup.addButton(new Button(this, width / 2, start, 'Resume', () => this.resume(), { fontSize }));

    buttonGroup.addButton(
      new Button(
        this,
        width / 2,
        start + spacing,
        'Save',
        () => {
          this.resume();
          save(this.parent);
        },
        { fontSize }
      )
    );

    buttonGroup.addButton(
      new Button(
        this,
        width / 2,
        start + spacing * 2,
        'Load',
        () => {
          this.resume();
          this.parent.scene.restart();
        },
        { fontSize }
      )
    );

    buttonGroup.addButton(
      new Button(
        this,
        width / 2,
        start + spacing * 3,
        'Toggle Gamepad',
        () => {
          this.parent.gamepad.setVisible(!this.parent.gamepad.visible);
        },
        { fontSize }
      )
    );

    __TAURI__ &&
      buttonGroup.addButton(
        new Button(
          this,
          width / 2,
          start + spacing * 4,
          'Exit',
          () => {
            exit(0)
              .then(() => console.log('Exited'))
              .catch((e) => console.error(e));
          },
          { fontSize }
        )
      );

    // Keyboard interactions
    this.input.keyboard?.on('keydown-ESC', () => this.resume());

    new Gamepad(this).setVisible(false);
  }

  resume() {
    this.scene.stop();
    this.scene.resume('Game');
  }
}