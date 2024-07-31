import { GameObjects } from 'phaser';

import { Colors, getColorNumber } from '../../utils/colors';
import { Layer } from '../../utils/layers';

export class IconButton extends GameObjects.Container {
  img: GameObjects.Image;
  rect: GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, callback: (button: IconButton) => void) {
    super(scene, x, y);
    scene.add.existing(this);
    this.setScrollFactor(0).setDepth(Layer.Ui);

    this.rect = scene.add
      .rectangle(0, 0, 42, 42, getColorNumber(Colors.Teal))
      .setScrollFactor(0)
      .setStrokeStyle(2, getColorNumber(Colors.Black));
    this.img = scene.add.image(-1, 1, texture).setDisplaySize(32, 32);
    this.add(this.rect);
    this.add(this.img);

    this.rect.setInteractive({ useHandCursor: true }).on('pointerdown', () => callback(this));

    this.rect.on('pointerover', () => {
      this.rect.setScale(1.1);
      this.img.setDisplaySize(36, 36);
    });
    this.rect.on('pointerout', () => {
      this.rect.setScale(1);
      this.img.setDisplaySize(32, 32);
    });
  }
}
