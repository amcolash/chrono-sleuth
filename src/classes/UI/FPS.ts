import { GameObjects, Math as PhaserMath } from 'phaser';

import { Layer } from '../../data/layers';
import { Colors, getColorNumber } from '../../utils/colors';
import { fontStyle } from '../../utils/fonts';

const BUFFER_SIZE = 4 * 60; // last 240 frames
const HEIGHT = 40;

export class FPS extends GameObjects.Container {
  buffer: number[] = new Array(BUFFER_SIZE).fill(0); // ring buffer
  index: number = 0;
  maxText: GameObjects.Text;
  graphics: GameObjects.Graphics;
  nextFrame: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);
    this.setDepth(Layer.Debug).setScrollFactor(0);

    this.graphics = scene.add.graphics();

    const minText = scene.add.text(BUFFER_SIZE + 10, HEIGHT - 22, '0', { ...fontStyle, fontSize: 20 });
    this.maxText = scene.add.text(BUFFER_SIZE + 10, -6, '0', { ...fontStyle, fontSize: 20 });

    this.add([this.graphics, minText, this.maxText]);
  }

  update(time: number, delta: number) {
    // only collect at 60fps, skip faster frames
    if (time < this.nextFrame) return;

    this.buffer[this.index] = 1000 / delta;
    this.index = (this.index + 1) % BUFFER_SIZE;

    this.graphics.clear();
    this.graphics.fillStyle(getColorNumber(Colors.Black));
    this.graphics.fillRect(0, 0, BUFFER_SIZE, HEIGHT);

    this.graphics.lineStyle(1, 0x00ff00);

    const maxFps = Math.max(...this.buffer);
    this.maxText.setText(`${maxFps.toFixed(0)}`);

    // draw a line for each frame in buffer, 1px wide
    for (let i = 0; i < BUFFER_SIZE; i++) {
      const value = this.buffer[(this.index + i) % BUFFER_SIZE];
      const y = PhaserMath.Clamp(HEIGHT - HEIGHT * (value / maxFps), 0, maxFps);
      this.graphics.lineBetween(i, HEIGHT, i, y);
    }

    this.nextFrame = time + 1000 / 61; // 61 to avoid rounding errors
  }
}
