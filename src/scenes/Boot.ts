import { Scene } from 'phaser';

import { Config } from '../config';
import { fontStyle } from '../utils/fonts';

// scene to load immediately w/o fully initialized game
let bootScene: string | undefined;
// bootScene = 'UITest';

export class Boot extends Scene {
  constructor() {
    super({
      key: 'Boot',
      pack: {
        files: [{ type: 'image', key: 'splash', url: 'assets/splash.jpg' }],
      },
    });
  }

  init() {
    this.add.image(0, 0, 'splash').setOrigin(0).setDisplaySize(Config.width, Config.height);
  }

  preload() {
    //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
    //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.
    this.load.setPath('assets');

    this.load.image('logo', 'logo.jpg');
    this.load.font('m6x11', '../m6x11.ttf');

    this.load.svg('maximize', 'icons/maximize.svg', { width: 64, height: 64 });
    this.load.svg('minimize', 'icons/minimize.svg', { width: 64, height: 64 });
    this.load.svg('settings', 'icons/settings.svg', { width: 64, height: 64 });

    if (import.meta.env.PROD) {
      this.load.json('build', `../build.json?cacheBust=${Date.now()}`);
    }
  }

  create() {
    if (import.meta.env.PROD) {
      try {
        const build = this.cache.json.get('build')?.buildTime;
        if (build && build !== __BUILD_TIME__) {
          const text = this.add
            .text(Config.width / 2, Config.height / 2, 'New version available!\nUpdating Game...', {
              ...fontStyle,
              align: 'center',
              fontSize: 48,
            })
            .setOrigin(0.5);
          text.postFX.addGlow(0x000000, 10);

          setTimeout(() => window.location.reload(), 15000); // fallback in case the game doesn't reload

          return;
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (bootScene && !import.meta.env.PROD) {
      this.scene.start(bootScene);
      return;
    }

    if (!Config.prod) this.scene.start('Preloader');
    else this.scene.start('MainMenu');
  }
}
