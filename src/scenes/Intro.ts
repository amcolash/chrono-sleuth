import { GameObjects, Scene } from 'phaser';

import { Music, musicFileMapping } from '../classes/Music';
import { Config } from '../config';
import { SaveType, saves } from '../data/saves';
import { MusicType } from '../data/types';
import { trainIntro } from '../utils/cutscene';
import { fadeIn, fadeOut } from '../utils/util';

// Export the preload function (so it can be used in the main Preloader)
export function preloadIntro(scene: Scene) {
  scene.load.setPath('assets');

  scene.load.image('train', 'maps/intro/train.png');

  scene.load.image('layer2', 'maps/intro/layer2.png');
  scene.load.image('layer3', 'maps/intro/layer3.png');
  scene.load.image('layer4', 'maps/intro/layer4.png');
  scene.load.image('layer5', 'maps/intro/layer5.png');

  scene.load.spritesheet('character', 'characters/player.png', { frameWidth: 128, frameHeight: 80 });
  scene.load.image('player_portrait', 'characters/player_portrait.png');

  scene.load.svg('chevron-down', 'icons/chevron-down.svg', { width: 64, height: 64 });

  scene.load.audio(MusicType.Intro, musicFileMapping[MusicType.Intro]);
}

export class Intro extends Scene {
  player: GameObjects.Sprite;

  playerProgess: number = 0;
  direction: number = 1;
  pauseDuration: number = 0;

  constructor() {
    super('Intro');
  }

  preload() {
    preloadIntro(this);
  }

  init() {
    this.sound.mute = saves[SaveType.New].settings.muted;

    if (!Config.prod) {
      this.input.keyboard?.on('keydown-BACK_SLASH', () => {
        fadeOut(this, 500, () => {
          if (this.textures.exists('warp')) {
            this.scene.start('Game');
          } else {
            this.scene.start('Preloader');
          }
        });
      });

      this.input.keyboard?.on('keydown-R', () => {
        this.scene.restart();
      });
    }
  }

  create() {
    Music.setScene(this);
    Music.start(MusicType.Intro);

    const scale = Config.zoomed ? 0.75 : 1;

    fadeIn(this, 350);

    this.add.image(Config.width, Config.height, 'layer5').setScale(5 * scale);

    const layer4_1 = this.add.image(0, Config.height, 'layer4').setScale(5 * scale);
    const layer4_2 = this.add.image(0, Config.height, 'layer4').setScale(5 * scale);

    const layer3 = this.add.image(0, 350 * scale, 'layer3').setScale(2 * scale);
    const layer2 = this.add.image(0, Config.height * 0.7, 'layer2').setScale(5 * scale);

    const movement = Config.width;
    let duration = 15000;
    // duration = 5000;
    // duration = 500;

    this.tweens.add({
      targets: [layer4_1],
      x: { from: -movement * 2.5, to: 0 },
      duration: duration * 8,
      repeat: -1,
    });
    this.tweens.add({
      targets: [layer4_2],
      x: { from: 0, to: movement * 2.5 },
      duration: duration * 8,
      repeat: -1,
    });

    this.tweens.add({
      targets: layer3,
      x: { from: -movement * 2, to: movement * 2.75 },
      duration: duration * 4,
      hold: duration * 6,
      repeat: -1,
    });

    this.tweens.add({
      targets: [layer2],
      x: { from: -movement, to: movement * 1.5 },
      duration,
      hold: duration * 3,
      repeat: -1,
    });

    const trainContainer = this.add.container(0, Config.zoomed ? -35 : 0);

    this.player = this.add.sprite(560 * scale, Config.height - 250 * scale, 'character', 0).setScale(2.5 * scale);
    this.player.anims.create({
      key: 'walk',
      frames: this.player.anims.generateFrameNumbers('character', { start: 0, end: 5 }),
      frameRate: 5,
      repeat: -1,
    });

    this.player.anims.play('walk');
    this.player.anims.pause();

    trainContainer.add(this.player);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1, 0, 120);

    const train = this.add.image(Config.width / 2, Config.height / 2, 'train').setScale(2 * scale);
    trainContainer.add(train);

    this.tweens.add({
      targets: trainContainer,
      x: trainContainer.x + 1,
      y: trainContainer.y + 5,
      duration: 300,
      hold: 300,
      ease: 'Bounce',
      repeat: -1,
    });

    const bridge = this.add
      .rectangle(-Config.width / 2, Config.height - (Config.zoomed ? 60 : 35), Config.width * 2, 35, 0x444040)
      .setOrigin(0);
    bridge.postFX?.addShadow(0, 0, 0.5, 1);

    // this.cameras.main.zoom = 0.75;
    // this.add.rectangle(0, 0, Config.width, Config.height).setOrigin(0).setStrokeStyle(10, 0x00ff00);

    trainIntro(this, this.player);
  }
}
