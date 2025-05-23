import { Scene } from 'phaser';

import { createMusicInstance, musicFileMapping } from '../classes/Music';
import { Config } from '../config';
import { saveKey } from '../data/saves';
import { MusicType } from '../data/types';
import { fontStyle } from '../utils/fonts';

// scene to load immediately w/o fully initialized game
let bootScene: string | undefined;
// bootScene = 'UITest';

export class Boot extends Scene {
  constructor() {
    super({
      key: 'Boot',
      pack: {
        files: [
          { type: 'image', key: 'splash', url: 'assets/splash.jpg' },
          { type: 'image', key: 'logo', url: 'assets/logo.jpg' },
        ],
      },
    });
  }

  init() {
    this.add.image(0, 0, 'splash').setOrigin(0).setDisplaySize(Config.width, Config.height);
    this.add
      .image(35, Config.height - 30, 'logo')
      .setOrigin(0, 1)
      .setScale(0.4);

    createMusicInstance(this.sound);
  }

  preload() {
    //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
    //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.
    this.load.setPath('assets');

    this.load.font('m6x11', 'fonts/m6x11.ttf', 'truetype');
    this.load.bitmapFont('m6x11-24', 'fonts/m6x11-24.png', 'fonts/m6x11-24.xml');
    this.load.font('notepen', 'fonts/Notepen.ttf', 'truetype');
    this.load.font('Germania One', 'fonts/GermaniaOne-Regular.ttf', 'truetype');

    // icons
    this.load.atlas('icons', 'atlases/icons.png', 'atlases/icons.json');

    // audio sprites
    this.load.audioSprite('words', 'sounds/words.json');
    this.load.audioSprite('sfx', 'sounds/sfx.json');

    if (import.meta.env.PROD) {
      this.load.audio(MusicType.Town, musicFileMapping[MusicType.Town]);
      this.load.json('build', `../build.json?cacheBust=${Date.now()}`);
    }

    if (Config.phaserInspector) {
      this.load.scripts('inspector', [
        'https://cdn.jsdelivr.net/npm/tweakpane@3.1.10/dist/tweakpane.js',
        'https://cdn.jsdelivr.net/npm/phaser-plugin-inspector@2.5.0/dist/phaser-plugin-inspector.umd.js',
      ]);
      this.load.once('complete', () => {
        // @ts-ignore
        PhaserPluginInspector.Install(this.plugins);
      });
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

          // Clear all of the cache for a new update (TODO: figure out a better way in the future if the game gets much bigger)
          caches.keys().then((cacheNames) => {
            for (const cacheName of cacheNames) {
              caches.delete(cacheName);
            }
          });

          setTimeout(() => window.location.reload(), 3000);

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

    // Skip menu if there is no save
    if (!Config.prod || !localStorage.getItem(saveKey)) this.scene.start('Preloader');
    else this.scene.start('MainMenu');
  }
}
