import { GameObjects, Scene } from 'phaser';

import { Config } from '../../config';
import { Layer } from '../../data/layers';
import { Colors } from '../../utils/colors';
import { fontStyle } from '../../utils/fonts';

export class ButtonPrompt extends GameObjects.Text {
  constructor(scene: Scene) {
    super(scene, Config.width / 2, Config.height - 50, '', fontStyle);

    this.setOrigin(0.5)
      .setBackgroundColor('#' + Colors.Black)
      .setPadding(10, 5)
      .setAlign('center')
      .setAlpha(0.8)
      .setScrollFactor(0)
      .setDepth(Layer.Overlay)
      .setVisible(false);

    scene.add.existing(this);
  }
}
