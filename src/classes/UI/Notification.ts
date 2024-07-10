import { GameObjects, Scene } from 'phaser';

import { Config } from '../../config';
import { Colors, fontStyle } from '../../utils/colors';

export class Notification extends GameObjects.Text {
  constructor(scene: Scene, text: string) {
    super(scene, 0, 30, text, {
      ...fontStyle,
      backgroundColor: '#' + Colors.Teal,
      padding: { x: 10, y: 5 },
    });
    this.setAlpha(0)
      .setDepth(2)
      .setScrollFactor(0)
      .setX(Config.width - this.displayWidth - 20);

    scene.add.existing(this);

    scene.add.tween({
      targets: this,
      alpha: 1,
      duration: 350,
      hold: 3500,
      yoyo: true,
      repeat: 0,
      onComplete: () => this.destroy(),
    });
  }
}
