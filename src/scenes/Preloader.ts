import { Scene } from 'phaser';

import { Config } from '../config';

export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  init() {
    //  A simple progress bar. This is the outline of the bar.
    const outline = this.add
      .rectangle(Config.width / 2, Config.height / 2, Config.width * 0.75, 32)
      .setStrokeStyle(1, 0xffffff);

    //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    const bar = this.add.rectangle(4 + outline.x - outline.width / 2, Config.height / 2, 4, 27, 0xffffff);

    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on('progress', (progress: number) => {
      //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
      bar.width = Config.width * 0.75 * progress - 5;
    });
  }

  preload() {
    //  Load the assets for the game - Replace with your own assets
    this.load.setPath('assets');

    // backgrounds
    this.load.image('town', 'maps/town.jpg');

    this.load.image('clock_outside', 'maps/clock_outside.jpg');
    this.load.image('clock_inner', 'maps/clock_inner.jpg');

    this.load.image('forest', 'maps/forest.jpg');
    this.load.image('lake', 'maps/lake.jpg');

    // interactive objects
    this.load.image('ladder', 'ladder.png');
    this.load.image('warp', 'warp.png');
    this.load.image('watch', 'watch.png');
    this.load.image('arrow', 'arrow.png');

    // items
    this.load.image('gear', 'items/gear.png');
    this.load.image('journal', 'items/journal.png');
    this.load.image('wrench', 'items/wrench.png');

    // this.load.image('map', 'items/map.png');
    // this.load.image('book', 'items/book.png');
    // this.load.image('candle', 'items/candle.png');
    // this.load.image('dagger', 'items/dagger.png');
    // this.load.image('lantern', 'items/lantern.png');
    // this.load.image('letter', 'items/letter.png');
    // this.load.image('lockpick', 'items/lockpick.png');

    // characters
    // this.load.spritesheet('character', 'characters/player.png', { frameWidth: 24, frameHeight: 36 });
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
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.
    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    this.scene.start('Game');
  }
}
