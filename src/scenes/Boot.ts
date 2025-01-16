import { Scene } from 'phaser';

import { createMusicInstance } from '../classes/Music';
import { Config } from '../config';
import { saveKey } from '../data/saves';
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

    this.sound.pauseOnBlur = false;
    createMusicInstance(this.sound);
  }

  preload() {
    //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
    //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.
    this.load.setPath('assets');

    this.load.image('logo', 'logo.jpg');
    this.load.font('m6x11', '../m6x11.ttf', 'truetype');
    this.load.bitmapFont('m6x11-24', 'fonts/m6x11-24.png', 'fonts/m6x11-24.xml');

    this.load.svg('maximize', 'icons/maximize.svg', { width: 64, height: 64 });
    this.load.svg('minimize', 'icons/minimize.svg', { width: 64, height: 64 });
    this.load.svg('settings', 'icons/settings.svg', { width: 64, height: 64 });

    if (import.meta.env.PROD) {
      this.load.json('build-cached', '../build.json');
      this.load.json('build-fresh', `../build.json?cacheBust=${Date.now()}`);
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
        const buildCached = this.cache.json.get('build-cached');
        const buildFresh = this.cache.json.get('build-fresh');

        if (buildCached?.buildTime !== buildFresh?.buildTime) {
          const text = this.add
            .text(Config.width / 2, Config.height / 2, 'New version available!\nUpdating Game...', {
              ...fontStyle,
              align: 'center',
              fontSize: 48,
            })
            .setOrigin(0.5);
          text.postFX.addGlow(0x000000, 10);

          caches.keys().then(async (cacheNames) => {
            for (const cacheName of cacheNames) {
              const cache = await caches.open(cacheName);
              const keys = await cache.keys();

              for (const request of keys) {
                const file = decodeURIComponent(request.url.replace(location.href, ''));

                if (buildCached?.files[file] && buildCached.files[file] !== buildFresh.files[file]) {
                  console.log('Deleting cache for', file);
                  await cache.delete(request);
                }
              }
            }
          });

          setTimeout(() => window.location.reload(), 2000); // fallback in case the game doesn't reload

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
