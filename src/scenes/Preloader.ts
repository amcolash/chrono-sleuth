import { GameObjects, Scene } from 'phaser';

import { Config } from '../config';
import { fadeIn, fadeOut } from '../utils/util';

export class Preloader extends Scene {
  container: GameObjects.Container;

  constructor() {
    super('Preloader');
  }

  init(data: { skipFade: boolean }) {
    this.add.image(0, 0, 'splash').setOrigin(0).setDisplaySize(Config.width, Config.height);
    this.add
      .image(30, Config.height - 15, 'logo')
      .setOrigin(0, 1)
      .setScale(0.25);

    const width = Config.width * 0.68;
    const height = 26;
    const margin = 3;
    const container = this.add.container(Config.width * 0.23, Config.height * 0.91);
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
          duration: 2400,
        });
      });
    }

    const gear = document.createElement('img');
    gear.src = 'assets/icons/settings.svg?2'; // weird phaser issue
    gear.id = 'loading';

    this.add.dom(0, 0, gear);

    if (!data?.skipFade) fadeIn(this, 300);
  }

  preload() {
    //  Load the assets for the game - Replace with your own assets
    this.load.setPath('assets');

    // icons
    this.load.svg('sun', 'icons/sun.svg', { width: 64, height: 64 });
    this.load.svg('moon', 'icons/moon.svg', { width: 64, height: 64 });
    this.load.svg('settings', 'icons/settings.svg', { width: 64, height: 64 });
    this.load.svg('zoom-in', 'icons/zoom-in.svg', { width: 64, height: 64 });
    this.load.svg('zoom-out', 'icons/zoom-out.svg', { width: 64, height: 64 });
    this.load.svg('terminal', 'icons/terminal.svg', { width: 64, height: 64 });
    this.load.svg('award', 'icons/award.svg', { width: 64, height: 64 });

    // backgrounds
    this.load.image('town', 'maps/town.jpg');

    this.load.image('clock_outside', 'maps/clock_outside.jpg');
    this.load.image('clock_inner', 'maps/clock_inner.jpg');

    this.load.image('forest', 'maps/forest.jpg');
    this.load.image('lake', 'maps/lake.jpg');

    this.load.image('mansion_outside', 'maps/mansion_outside_hatch.jpg');
    this.load.image('mansion_inside', 'maps/mansion_inside.jpg');
    this.load.image('alchemy_lab', 'maps/alchemy_lab.jpg');

    this.load.image('library', 'maps/library.jpg');

    // interactive objects
    this.load.image('watch', 'items/watch.png');
    this.load.image('ladder', 'props/ladder.png');
    this.load.image('warp', 'props/warp.png');

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
    this.load.spritesheet('character', 'characters/player.png', { frameWidth: 128, frameHeight: 80 });
    this.load.image('player_portrait', 'characters/player_portrait.png');

    this.load.image('inventor', 'characters/inventor.png');
    this.load.image('inventor_portrait', 'characters/inventor_portrait.png');

    this.load.image('stranger', 'characters/stranger.png');
    this.load.image('stranger_portrait', 'characters/stranger_portrait.png');

    this.load.image('sphinx', 'characters/sphinx.png');
    this.load.image('sphinx_portrait', 'characters/sphinx_portrait.png');

    this.load.image('mayor', 'characters/mayor.png');
    this.load.image('mayor_portrait', 'characters/mayor_portrait.png');

    this.load.image('clock_portrait', 'characters/clock_portrait.png');

    // props
    this.load.image('chest', 'props/chest.png');
    this.load.image('chest_open', 'props/chest_open.png');
    this.load.image('book', 'props/book.png');
    this.load.image('picture', 'props/picture.png');

    this.load.image('alchemy_empty', 'props/alchemy/alchemy_empty.png');
    this.load.image('alchemy_green', 'props/alchemy/alchemy_green.png');
    this.load.image('alchemy_red', 'props/alchemy/alchemy_red.png');
    this.load.image('alchemy_blue', 'props/alchemy/alchemy_blue.png');
    this.load.image('alchemy_full', 'props/alchemy/alchemy_full.png');

    // puzzles
    this.load.image('arrow', 'puzzles/arrow.png');
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.
    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.

    this.time.delayedCall(Config.prod ? 3000 : 0, () => {
      fadeOut(this, 300, () => {
        this.scene.start('Game');
      });
    });
  }
}
