import { Scene } from 'phaser';

export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  init() {
    //  A simple progress bar. This is the outline of the bar.
    this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

    //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on('progress', (progress: number) => {
      //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
      bar.width = 4 + 460 * progress;
    });
  }

  preload() {
    //  Load the assets for the game - Replace with your own assets
    this.load.setPath('assets');

    // backgrounds
    this.load.image('town', 'maps/town.jpg');
    this.load.image('forest', 'maps/forest.jpg');
    this.load.image('clock_outside', 'maps/clock_outside.jpg');
    this.load.image('clock_inner', 'maps/clock_inner.jpg');

    // interactive objects
    this.load.image('ladder', 'ladder.png');
    this.load.image('watch', 'watch.png');

    // items
    this.load.image('book', 'items/book.png');
    this.load.image('candle', 'items/candle.png');
    this.load.image('dagger', 'items/dagger.png');
    this.load.image('gear', 'items/gear.png');
    this.load.image('journal', 'items/journal.png');
    this.load.image('lantern', 'items/lantern.png');
    this.load.image('letter', 'items/letter.png');
    this.load.image('lockpick', 'items/lockpick.png');
    this.load.image('map', 'items/map.png');
    this.load.image('wrench', 'items/wrench.png');

    // characters
    this.load.spritesheet('character', 'characters/player.png', { frameWidth: 24, frameHeight: 36 });

    this.load.image('inventor', 'characters/inventor.png');
    this.load.image('inventor_portrait', 'characters/inventor_portrait.png');

    this.load.image('stranger', 'characters/stranger.png');
    this.load.image('stranger_portrait', 'characters/stranger_portrait.png');
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    this.scene.start('Game');
  }
}
