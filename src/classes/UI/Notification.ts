import { GameObjects, Scene } from 'phaser';

import { Colors } from '../../utils/colors';
import { fontStyle } from '../../utils/fonts';

export class Notification extends GameObjects.Text {
  constructor(scene: Scene, text: string) {
    super(scene, 20, 30, text, {
      ...fontStyle,
      backgroundColor: '#' + Colors.Teal,
      padding: { x: 10, y: 5 },
    });
    this.setAlpha(0).setDepth(2).setScrollFactor(0);

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
