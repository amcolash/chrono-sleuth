import { GameObjects } from 'phaser';

import { Config } from '../../config';
import { Colors, getColorNumber } from '../../utils/colors';
import { Layer } from '../../utils/layers';
import { isDaytime, toggleLighting } from '../../utils/lighting';

export class TimeButton extends GameObjects.Container {
  constructor(scene: Phaser.Scene) {
    super(scene, 81, Config.height - 31);
    scene.add.existing(this);
    this.setScrollFactor(0).setDepth(Layer.Ui);

    const rect = scene.add.rectangle(0, 0, 42, 42, getColorNumber(Colors.Teal)).setScrollFactor(0);
    const img = scene.add.image(0, 0, isDaytime(scene) ? 'moon' : 'sun');
    this.add(rect);
    this.add(img);

    rect.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      const prev = isDaytime(scene);
      toggleLighting(scene);
      img.setTexture(prev ? 'sun' : 'moon');
    });
  }
}
