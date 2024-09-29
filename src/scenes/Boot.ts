import { Scene } from 'phaser';

import { Config } from '../config';
import { fontStyle } from '../utils/fonts';

export class Boot extends Scene {
  constructor() {
    super('Boot');
  }

  init() {
    this.add.text(Config.width - 100, Config.height - 40, 'Loading...', fontStyle).setOrigin(1, 1);

    const gear = document.createElement('img');
    gear.src = 'assets/icons/settings.svg?1'; // weird phaser issue
    gear.id = 'loading';

    this.add.dom(0, 0, gear);
  }

  preload() {
    //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
    //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.
    this.load.setPath('assets');

    this.load.image('logo', 'logo.png');
    this.load.image('splash', 'splash.png');
    this.load.font('m6x11', '../m6x11.ttf');

    this.load.svg('maximize', 'icons/maximize.svg', { width: 64, height: 64 });
    this.load.svg('minimize', 'icons/minimize.svg', { width: 64, height: 64 });

    if (import.meta.env.PROD) {
      this.load.json('build', '../build.json');
    }
  }

  create() {
    if (import.meta.env.PROD) {
      const build = this.cache.json.get('build')?.buildTime;
      if (build && build !== __BUILD_TIME__) {
        this.add
          .text(Config.width / 2, Config.height / 2, 'New version available!\nUpdating Game...', {
            ...fontStyle,
            align: 'center',
            fontSize: 48,
          })
          .setOrigin(0.5);
        return;
      }
    }

    if (!Config.prod) this.scene.start('Preloader');
    else this.scene.start('MainMenu');
  }
}
