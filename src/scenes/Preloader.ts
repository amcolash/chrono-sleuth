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

    const gear = this.add.image(Config.width - 50, Config.height - 60, 'settings').setScale(0.75);
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

    // icons
    this.load.image('sun', 'icons/sun.png');
    this.load.image('moon', 'icons/moon.png');
    this.load.image('zoom-in', 'icons/zoom-in.png');
    this.load.image('zoom-out', 'icons/zoom-out.png');
    this.load.image('terminal', 'icons/terminal.png');
    this.load.image('award', 'icons/award.png');
    this.load.image('tv', 'icons/tv.png');
    this.load.image('save', 'icons/save.png');
    this.load.image('chevron-down', 'icons/chevron-down.png');
    this.load.image('volume', 'icons/volume-2.png');
    this.load.image('volume-mute', 'icons/volume-x.png');

    // fontawesome icons
    this.load.image('gamepad', 'icons/gamepad-solid.png');

    // backgrounds
    this.load.image('station', 'maps/station.jpg');
    this.load.image('town', 'maps/town.jpg');
    this.load.image('town_hall', 'maps/town_hall.jpg');
    this.load.image('inn', 'maps/inn.jpg');

    this.load.image('clock_outside', 'maps/clock_outside.jpg');
    this.load.image('clock_inner', 'maps/clock_inner.jpg');

    this.load.image('forest', 'maps/forest.jpg');
    this.load.image('lake', 'maps/lake.jpg');

    this.load.image('mansion_outside', 'maps/mansion_outside.jpg');
    this.load.image('mansion_inside', 'maps/mansion_inside.jpg');
    this.load.image('alchemy_lab', 'maps/alchemy_lab.jpg');

    // interactive objects
    this.load.image('watch', 'items/watch.png');
    this.load.image('warp', 'props/warp.png');
    this.load.spritesheet('portal', 'props/portal.png', { frameWidth: 140, frameHeight: 120 });

    // items
    this.load.image('gear', 'items/gear.png');
    this.load.image('gear2', 'items/gear2.png');
    this.load.image('journal', 'items/journal.png');
    this.load.image('wrench', 'items/wrench.png');
    this.load.image('key', 'items/key.png');
    this.load.image('herb_red', 'items/herb_red.png');
    this.load.image('herb_green', 'items/herb_green.png');
    this.load.image('herb_blue', 'items/herb_blue.png');
    this.load.image('potion', 'items/potion.png');

    // characters
    this.load.spritesheet('character', 'characters/player.png', { frameWidth: 40, frameHeight: 74 });
    this.load.image('inventor', 'characters/inventor.png');
    this.load.image('stranger', 'characters/stranger.png');
    this.load.image('sphinx', 'characters/sphinx.png');
    this.load.image('mayor', 'characters/mayor.png');
    this.load.image('innkeeper', 'characters/innkeeper.png');
    this.load.image('baker', 'characters/baker.png');

    // portraits
    this.load.image('player_portrait', 'characters/player_portrait.png');
    this.load.image('inventor_portrait', 'characters/inventor_portrait.png');
    this.load.image('stranger_portrait', 'characters/stranger_portrait.png');
    this.load.image('sphinx_portrait', 'characters/sphinx_portrait.png');
    this.load.image('mayor_portrait', 'characters/mayor_portrait.png');
    this.load.image('innkeeper_portrait', 'characters/innkeeper_portrait.png');
    this.load.image('baker_portrait', 'characters/baker_portrait.png');

    this.load.image('clock_portrait', 'characters/clock_portrait.png');

    // props
    this.load.image('chest', 'props/chest.png');
    this.load.image('chest_open', 'props/chest_open.png');
    this.load.image('book', 'props/book.png');
    this.load.image('picture', 'props/picture.png');
    this.load.image('safe', 'props/safe.png');

    this.load.image('alchemy_empty', 'props/alchemy/alchemy_empty.png');
    this.load.image('alchemy_green', 'props/alchemy/alchemy_green.png');
    this.load.image('alchemy_red', 'props/alchemy/alchemy_red.png');
    this.load.image('alchemy_blue', 'props/alchemy/alchemy_blue.png');
    this.load.image('alchemy_full', 'props/alchemy/alchemy_full.png');

    this.load.image('train_sign', 'props/train_sign.png');
    this.load.image('inn_sign', 'props/inn_sign.png');

    // audio sprites
    this.load.audioSprite('words', 'sounds/words.json');

    // music
    Object.entries(musicFileMapping)
      .filter(([key, _value]) => key !== MusicType.Town)
      .forEach(([key, value]) => {
        this.load.audio(key, value);
      });

    // Main game intro
    if (!this.load.textureManager.exists('train')) this.load.image('train', 'maps/intro/train.png');

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
