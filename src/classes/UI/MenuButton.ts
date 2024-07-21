import { GameObjects } from 'phaser';

import { Config } from '../../config';
import { Colors } from '../../utils/colors';
import { Layer } from '../../utils/layers';

export class MenuButton extends GameObjects.Text {
  constructor(scene: Phaser.Scene) {
    super(scene, 24, Config.height - 22, '⚙', {
      fontSize: '48px',
      backgroundColor: `#${Colors.Teal}`,
      padding: { x: 3, y: 3 },
      align: 'center',
    });

    scene.add.existing(this);

    this.setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(Layer.Ui)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        scene.scene.pause();
        scene.scene.launch('Paused', { game: this });
      });
  }
}
