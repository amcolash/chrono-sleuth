import { exit } from '@tauri-apps/plugin-process';
import { GameObjects, Scene } from 'phaser';

import { Button } from '../../classes/UI/Button';
import { ButtonGrid } from '../../classes/UI/ButtonGrid';
import { FullscreenButton } from '../../classes/UI/FullscreenButton';
import { Gamepad } from '../../classes/UI/Gamepad';
import { IconButton } from '../../classes/UI/IconButton';
import { Config } from '../../config';
import { fontStyle } from '../../utils/fonts';
import { toggleCrt } from '../../utils/shaders';
import { Game } from '../Game';

export class Paused extends Scene {
  parent: Game;
  debugCount: number;
  container: GameObjects.Container;

  constructor() {
    super('Paused');
  }

  init(data: { game: Game }) {
    this.parent = data.game;
  }

  create() {
    const { width, height } = Config;

    this.container = this.add.container(0, 0);

    this.container.add(
      this.add
        .rectangle(width / 2, height / 2, width, height, 0x000000, 0.75)
        .setInteractive()
        .on('pointerdown', () => this.resume())
    );

    this.container.add(
      this.add.text(width / 2, Config.height / 2 - 100, 'Game Paused', { ...fontStyle, fontSize: 72 }).setOrigin(0.5)
    );

    this.debugCount = 0;
    this.container.add(
      this.add
        .text(
          width - 20,
          height - 20,
          `Build Time: ${new Date(__BUILD_TIME__).toLocaleString()}\n${Config.prod ? '' : 'Debug Mode'}`,
          {
            ...fontStyle,
            fontSize: 16,
            align: 'right',
            padding: { x: 20, y: 20 },
          }
        )
        .setOrigin(1, 1)
        .setInteractive({ useHandCursor: !import.meta.env.PROD })
        .on('pointerdown', () => {
          this.debugCount++;
          if (this.debugCount > 10) {
            localStorage.setItem('chrono-sleuth-prod', Config.prod ? 'false' : 'true');
            window.location.reload();
          }
        })
    );

    const large = !Config.zoomed;
    const spacing = large ? 100 : 80;
    const fontSize = large ? 48 : 36;
    const start = large ? 220 : 180;

    const buttonGrid = new ButtonGrid(this);
    this.container.add(buttonGrid);

    const gamepadButton = new IconButton(this, Config.width - 90, 30, 'gamepad', () => {
      this.parent.gamepad.setVisible(!this.parent.gamepad.visible);
    });
    const shaderButton = new IconButton(this, Config.width - 150, 30, 'tv', () => {
      toggleCrt();
    });
    const fullscreenButton = new FullscreenButton(this, Config.width - 30, 30);

    const resumeButton = new Button(this, width / 2, Config.height / 2, 'Resume', () => this.resume(), { fontSize });

    let exitButton;
    if (__TAURI__)
      exitButton = new Button(
        this,
        width / 2,
        start + spacing * 3,
        'Exit',
        () => {
          exit(0)
            .then(() => console.log('Exited'))
            .catch((e) => console.error(e));
        },
        { fontSize }
      );

    buttonGrid.setButtons([
      [shaderButton, gamepadButton, fullscreenButton],
      [resumeButton, undefined, undefined],
      [exitButton, undefined, undefined],
    ]);

    buttonGrid.activeIndex.set(0, 1);

    // Keyboard interactions
    this.input.keyboard?.on('keydown-ESC', () => this.resume());

    new Gamepad(this).setVisible(false);

    this.tweens.add({
      targets: this.container,
      alpha: { start: 0, to: 1 },
      duration: 250,
    });
  }

  resume() {
    this.tweens.add({
      targets: this.container,
      alpha: { start: 1, to: 0 },
      duration: 250,
      onComplete: () => {
        this.scene.stop();
        this.scene.resume('Game');
      },
    });
  }
}
