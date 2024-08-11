import { Scene } from 'phaser';

import { Button } from '../classes/UI/Button';
import { ButtonGroup } from '../classes/UI/ButtonGroup';
import { Config } from '../config';
import { saveKey } from '../data/saves';
import { fadeIn } from '../utils/util';

export class MainMenu extends Scene {
  constructor() {
    super('MainMenu');
  }

  create() {
    this.add.image(0, 0, 'splash').setOrigin(0).setDisplaySize(Config.width, Config.height);
    this.add
      .image(30, Config.height - 15, 'logo')
      .setOrigin(0, 1)
      .setScale(0.25);

    const buttonGroup = new ButtonGroup(this);

    if (localStorage.getItem(saveKey)) {
      buttonGroup.addButton(
        new Button(
          this,
          Config.width - 120,
          Config.height - 145,
          'Continue',
          () => {
            this.scene.stop(this);
            this.scene.start('Preloader', { skipFade: true });
          },
          { align: 'center' }
        ).setFixedSize(200, 70)
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
          this.scene.stop(this);
          this.scene.start('Preloader', { skipFade: true });
        },
        { align: 'center' }
      ).setFixedSize(200, 70)
    );

    fadeIn(this, 300);
  }
}
