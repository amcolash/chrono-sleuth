import { GameObjects, Scene } from 'phaser';

import { musicFileMapping } from '../classes/Music';
import { Config } from '../config';
import { saveKey } from '../data/saves';
import { MusicType } from '../data/types';
import { preloadIntro } from './Intro';

export function preloadMain(scene: Scene) {
  //  Load the assets for the game - Replace with your own assets
  scene.load.setPath('assets');

  // backgrounds
  scene.load.image('station', 'maps/station.png');
  scene.load.image('town', 'maps/town.png');
  scene.load.image('library', 'maps/library.png');
  scene.load.image('inn', 'maps/inn.png');

  scene.load.image('clock_outside', 'maps/clock_outside.png');
  scene.load.image('clock_inner', 'maps/clock_inner.png');

  scene.load.image('forest', 'maps/forest.png');
  scene.load.image('lake', 'maps/lake.png');

  scene.load.image('mansion_outside', 'maps/mansion_outside.png');
  scene.load.image('mansion_inside', 'maps/mansion_inside.png');
  scene.load.image('alchemy_lab', 'maps/alchemy_lab.png');

  // spritesheets
  scene.load.spritesheet('portal', 'spritesheets/portal.png', { frameWidth: 140, frameHeight: 120 });
  scene.load.spritesheet('character', 'spritesheets/player.png', { frameWidth: 40, frameHeight: 74 });

  // atlases
  scene.load.atlas('items', 'atlases/items.png', 'atlases/items.json');
  scene.load.atlas('props', 'atlases/props.png', 'atlases/props.json');
  scene.load.atlas('characters', 'atlases/characters.png', 'atlases/characters.json');

  // music
  if (Config.prod) {
    Object.entries(musicFileMapping)
      .filter(([key, _value]) => key !== MusicType.Town)
      .forEach(([key, value]) => {
        scene.load.audio(key, value);
      });
  }

  // Main game intro
  scene.load.image('train', 'maps/intro/train.png');

  // optionally preload intro
  if (!localStorage.getItem(saveKey)) {
    preloadIntro(scene);
  }
}

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
    preloadMain(this);
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.
    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.

    // if (Config.prod) {
    //   this.time.delayedCall(2500, () => fadeOut(this, 300, () => this.start()));
    // } else {
    this.start();
    // }
  }

  start() {
    if (localStorage.getItem(saveKey)) {
      this.scene.start('Game');
    } else {
      this.scene.start('Intro');
    }
  }
}
