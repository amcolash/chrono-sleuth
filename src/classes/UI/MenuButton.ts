import { GameObjects } from 'phaser';

import { Config } from '../../config';
import { Colors, getColorNumber } from '../../utils/colors';
import { Layer } from '../../utils/layers';

export class MenuButton extends GameObjects.Container {
  constructor(scene: Phaser.Scene) {
    super(scene, 31, Config.height - 31);
    scene.add.existing(this);
    this.setScrollFactor(0).setDepth(Layer.Ui);

    const rect = scene.add
      .rectangle(0, 0, 42, 42, getColorNumber(Colors.Teal))
      .setScrollFactor(0)
      .setStrokeStyle(2, getColorNumber(Colors.Black));
    const img = scene.add.image(-1, 1, 'settings').setDisplaySize(32, 32);
    this.add(rect);
    this.add(img);

    rect.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      scene.scene.pause();
      scene.scene.launch('Paused', { game: scene });
    });

    rect.on('pointerover', () => rect.setScale(1.1));
    rect.on('pointerout', () => rect.setScale(1));
  }
}
