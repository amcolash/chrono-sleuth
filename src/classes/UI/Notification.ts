import { GameObjects, Scene } from 'phaser';

import { Layer } from '../../data/layers';
import { Colors } from '../../utils/colors';
import { fontStyle } from '../../utils/fonts';
import { getGameObjects } from '../../utils/interactionUtils';

export class Notification extends GameObjects.Text {
  constructor(scene: Scene, text: string, duration: number = 3500, color: string = Colors.Slate) {
    const y =
      getGameObjects(scene, Notification).reduce((acc, obj) => {
        return Math.max(acc, obj.y - 20);
      }, 0) + 65;

    super(scene, 20, y, text, {
      ...fontStyle,
      backgroundColor: '#' + color,
      padding: { x: 10, y: 5 },
    });
    this.setAlpha(0).setDepth(Layer.Overlay).setScrollFactor(0);

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
