import { GameObjects } from 'phaser';

import { Config } from '../../config';
import { Colors } from '../../utils/colors';
import { fontStyle } from '../../utils/fonts';
import { Layer } from '../../utils/layers';

export class ButtonPrompt extends GameObjects.Text {
  constructor(scene: Phaser.Scene) {
    super(scene, Config.width / 2, Config.height - 50, '', fontStyle);

    this.setOrigin(0.5)
      .setBackgroundColor('#' + Colors.Black)
      .setPadding(10, 5)
      .setAlign('center')
      .setAlpha(0.9)
      .setScrollFactor(0)
      .setDepth(Layer.Overlay)
      .setVisible(false);

    scene.add.existing(this);
  }

  show(text: string) {
    this.setText(text).setVisible(true);
  }

  hide() {
    this.setVisible(false);
  }
}
