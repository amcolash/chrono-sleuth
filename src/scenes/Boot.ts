import { Scene } from 'phaser';

import { Config } from '../config';

export class Boot extends Scene {
  constructor() {
    super('Boot');
  }

  init() {
    this.add.text(Config.width - 20, Config.height - 20, 'Loading...').setOrigin(1, 1);
  }

  preload() {
    //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
    //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.
    // this.load.image('background', 'assets/bg.png');
    this.load.setPath('assets');

    this.load.image('logo', 'logo.png');
    this.load.image('splash', 'splash.png');
    this.load.font('m6x11', '../m6x11.ttf');
  }

  create() {
    // Load the gear asset through browser, so it is cached when loading bar appears on preloader
    const gear = document.createElement('img');
    gear.src = 'assets/icons/settings.svg';

    gear.onload = () => {
      if (!Config.prod) this.scene.start('Preloader');
      else this.scene.start('MainMenu');
    };
  }
}
