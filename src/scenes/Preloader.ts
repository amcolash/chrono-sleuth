import { GameObjects, Scene } from 'phaser';

import { musicFileMapping } from '../classes/Music';
import { Config } from '../config';
import { saveKey } from '../data/saves';
import { MusicType } from '../data/types';
import { fadeOut } from '../utils/util';
import { preloadIntro } from './Intro';

export class Preloader extends Scene {
  container: GameObjects.Container;

  constructor() {
    super('Preloader');
  }

  init() {
    this.add.image(0, 0, 'splash').setOrigin(0).setDisplaySize(Config.width, Config.height);
    this.add
      .image(35, Config.height - 30, 'logo')
      .setOrigin(0, 1)
      .setScale(0.4);

    const width = Config.width * 0.66;
    const height = Config.height * 0.05;
    const margin = 3;
    const container = this.add.container(Config.width * 0.24, Config.height * 0.86);
    this.container = container;

    //  A simple progress bar. This is the outline of the bar.
    const outline = this.add.rectangle(0, 0, width, height).setStrokeStyle(1, 0xffffff, 0.85).setOrigin(0);
    container.add(outline);

    //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    const bar = this.add.rectangle(margin, margin, 0, height - margin * 2, 0xffffff, 0.85).setOrigin(0);
    container.add(bar);

    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on('progress', (progress: number) => {
      const p = Config.prod ? progress * 0.6 : progress;
      bar.width = (width - margin * 2) * p;
    });

    // Fake progress on prod
    if (Config.prod) {
      this.load.on('complete', () => {
        this.tweens.add({
          targets: bar,
          width: width - margin * 2,
          duration: 2000,
        });
      });
    }

    const gear = this.add.image(Config.width - 50, Config.height - 60, 'icons', 'settings').setScale(0.75);
    this.tweens.add({
      targets: gear,
      angle: 360,
      duration: 2000,
      delay: 100,
      repeat: -1,
    });
  }

  preload() {
    //  Load the assets for the game - Replace with your own assets
    this.load.setPath('assets');

    // backgrounds
    this.load.image('station', 'maps/station.png');
    this.load.image('town', 'maps/town.png');
    this.load.image('library', 'maps/library.png');
    this.load.image('town_hall', 'maps/town_hall.png');
    this.load.image('inn', 'maps/inn.png');

    this.load.image('clock_outside', 'maps/clock_outside.png');
    this.load.image('clock_inner', 'maps/clock_inner.png');

    this.load.image('forest', 'maps/forest.png');
    this.load.image('lake', 'maps/lake.png');

    this.load.image('mansion_outside', 'maps/mansion_outside.png');
    this.load.image('mansion_inside', 'maps/mansion_inside.png');
    this.load.image('alchemy_lab', 'maps/alchemy_lab.png');

    // spritesheets
    this.load.spritesheet('portal', 'spritesheets/portal.png', { frameWidth: 140, frameHeight: 120 });
    this.load.spritesheet('character', 'spritesheets/player.png', { frameWidth: 40, frameHeight: 74 });

    // atlases
    this.load.atlas('items', 'atlases/items.png', 'atlases/items.json');
    this.load.atlas('props', 'atlases/props.png', 'atlases/props.json');
    this.load.atlas('characters', 'atlases/characters.png', 'atlases/characters.json');

    // music
    if (Config.prod) {
      Object.entries(musicFileMapping)
        .filter(([key, _value]) => key !== MusicType.Town)
        .forEach(([key, value]) => {
          this.load.audio(key, value);
        });
    }

    // Main game intro
    this.load.image('train', 'maps/intro/train.png');

    // optionally preload intro
    if (!localStorage.getItem(saveKey)) {
      preloadIntro(this);
    }
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.
    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.

    if (Config.prod) {
      this.time.delayedCall(2500, () => fadeOut(this, 300, () => this.start()));
    } else {
      this.start();
    }
  }

  start() {
    if (localStorage.getItem(saveKey)) {
      this.scene.start('Game');
    } else {
      this.scene.start('Intro');
    }
  }
}
