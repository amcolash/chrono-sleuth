import { Scene } from 'phaser';
import BBCodeText from 'phaser3-rex-plugins/plugins/bbcodetext';

import { Config } from '../../config';
import { Layer } from '../../data/layers';
import { Colors } from '../../utils/colors';

export class ButtonPrompt extends BBCodeText {
  constructor(scene: Scene) {
    super(scene, Config.width / 2, Config.height - 50, '', {
      fontFamily: 'm6x11, sans-serif',
      fontSize: 24,
      color: `#${Colors.White}`,
    });

    this.setOrigin(0.5)
      .setBackgroundColor('#' + Colors.Black)
      .setPadding(10, 5)
      .setAlign('center')
      .setAlpha(0.8)
      .setScrollFactor(0)
      .setDepth(Layer.Overlay)
      .setVisible(false);

    this.addImage('gamepad', { key: 'icons', frame: 'gamepad', width: 32, height: 42, y: -6 });

    scene.add.existing(this);
  }
}
