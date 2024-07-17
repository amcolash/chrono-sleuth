import { GameObjects, Scene } from 'phaser';

import { Colors } from '../../utils/colors';
import { fontStyle } from '../../utils/fonts';
import { getGameObjects } from '../../utils/interactionUtils';

export class Notification extends GameObjects.Text {
  constructor(scene: Scene, text: string, duration: number = 3500) {
    const notifications = getGameObjects(scene, Notification);
    const y = 20 + notifications.length * 50;

    super(scene, 20, y, text, {
      ...fontStyle,
      backgroundColor: '#' + Colors.Teal,
      padding: { x: 10, y: 5 },
    });
    this.setAlpha(0).setDepth(2).setScrollFactor(0);

    scene.add.existing(this);

    scene.add.tween({
      targets: this,
      alpha: 1,
      scale: 1.05,
      y: y + 10,
      duration: 350,
      hold: duration,
      yoyo: true,
      repeat: 0,
      onComplete: () => this.destroy(),
    });
  }
}
