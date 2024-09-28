import { Scene } from 'phaser';

import { Config } from '../config';

export class Boot extends Scene {
  constructor() {
    super('Boot');
  }

  init() {
    this.add.text(Config.width - 100, Config.height - 40, 'Loading...').setOrigin(1, 1);

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
  }

  create() {
    if (!Config.prod) this.scene.start('Preloader');
    else this.scene.start('MainMenu');
  }
}
