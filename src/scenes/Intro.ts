import { GameObjects, Scene } from 'phaser';

import { Config } from '../config';
import { trainIntro } from '../data/cutscene';
import { fadeIn } from '../utils/util';

export class Intro extends Scene {
  player: GameObjects.Sprite;

  playerProgess: number = 0;
  direction: number = 1;
  pauseDuration: number = 0;

  constructor() {
    super('Intro');
  }

  preload() {
    this.load.setPath('assets');

    this.load.image('train', 'maps/intro/train.png');

    this.load.image('layer1', 'maps/intro/layer1.png');
    this.load.image('layer2', 'maps/intro/layer2.png');
    this.load.image('layer3', 'maps/intro/layer3.png');
    this.load.image('layer4', 'maps/intro/layer4.png');
    this.load.image('layer5', 'maps/intro/layer5.png');

    this.load.spritesheet('character', 'characters/player.png', { frameWidth: 128, frameHeight: 80 });
    this.load.image('player_portrait', 'characters/player_portrait.png');
  }

  create() {
    fadeIn(this, 350);

    this.add.image(Config.width, Config.height, 'layer5').setScale(5);

    const layer4_1 = this.add.image(0, Config.height, 'layer4').setScale(5);
    const layer4_2 = this.add.image(0, Config.height, 'layer4').setScale(5);

    const layer3 = this.add.image(0, 350, 'layer3').setScale(2);
    const layer2 = this.add.image(0, Config.height * 0.7, 'layer2').setScale(5);

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
      x: { from: -2000, to: movement * 2.75 },
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

    const trainContainer = this.add.container(0, 0);

    this.player = this.add.sprite(560, Config.height - 250, 'character', 0).setScale(2.5);
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

    const train = this.add.image(Config.width / 2, Config.height / 2, 'train').setScale(2);
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
      .rectangle(-Config.width / 2, Config.height - 35, Config.width * 2, 35, 0x444040)
      .setOrigin(0);
    bridge.postFX?.addShadow(0, 0, 0.5, 1);

    // this.cameras.main.zoom = 0.5;
    // this.add.rectangle(0, 0, Config.width, Config.height).setOrigin(0).setStrokeStyle(10, 0x00ff00);

    trainIntro(this, this.player);
  }

  // update(time: number, delta: number): void {
  // }
}
