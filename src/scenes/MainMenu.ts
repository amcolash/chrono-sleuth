import { Scene } from 'phaser';

import { Music } from '../classes/Music';
import { Button } from '../classes/UI/Button';
import { ButtonGroup } from '../classes/UI/ButtonGroup';
import { FullscreenButton } from '../classes/UI/FullscreenButton';
import { Gamepad } from '../classes/UI/Gamepad';
import { InputManager } from '../classes/UI/InputManager';
import { Config } from '../config';
import { saveKey } from '../data/saves';
import { MusicType } from '../data/types';
import { preloadMain } from './Preloader';

export class MainMenu extends Scene {
  constructor() {
    super('MainMenu');
  }

  create() {
    Music.setScene(this);
    Music.start(MusicType.Town);

    this.add.image(0, 0, 'splash').setOrigin(0).setDisplaySize(Config.width, Config.height);

    const container = this.add.container(0, 0);
    container.setAlpha(0);
    this.tweens.add({
      targets: container,
      alpha: 1,
      duration: 150,
    });

    container.add(
      this.add
        .image(35, Config.height - 30, 'logo')
        .setOrigin(0, 1)
        .setScale(0.4)
    );

    // Add an input manager / gamepad to events
    new InputManager(this);
    new Gamepad(this, true).setVisible(false);

    const buttonGroup = new ButtonGroup(this);
    container.add(buttonGroup);

    const fullscreenButton = new FullscreenButton(this, Config.width - 30, 30);
    buttonGroup.addButton(fullscreenButton);

    if (localStorage.getItem(saveKey)) {
      buttonGroup.addButton(
        new Button(this, Config.width - 120, Config.height - 145, 'Continue', () => this.scene.start('Preloader'), {
          align: 'center',
        }).setFixedSize(200, 70)
      );
    }

    buttonGroup.addButton(
      new Button(
        this,
        Config.width - 120,
        Config.height - 60,
        'New Game',
        () => {
          localStorage.removeItem(saveKey);
          this.scene.start('Preloader');
        },
        { align: 'center' }
      ).setFixedSize(200, 70)
    );

    buttonGroup.setActiveButton(1);

    // Preload game assets after a small moment on the title screen
    this.time.delayedCall(1500, () => {
      preloadMain(this);
      this.load.start();
    });
  }
}
