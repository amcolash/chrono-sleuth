import { Display, GameObjects, Math as PhaserMath } from 'phaser';

import { Config } from '../../config';
import { Game } from '../../scenes/Game';

function r() {
  return Math.random() - 0.5;
}

export const FireflyPositions = {
  Forest: [3200, 600],
  Lake: [5350, 690],
};

const weights = [500, 200, 100, 50, 10];

export class Fireflies extends GameObjects.GameObject {
  scene: Game;
  center: PhaserMath.Vector2;

  lights: GameObjects.PointLight[] = [];
  count: number;
  centers: PhaserMath.Vector2[] = [];
  bounds: number[] = [1000, 400];
  biases: number[][] = [];

  debug: GameObjects.Graphics;

  constructor(scene: Game, x: number, y: number, count: number = 40, bounds: number[] = [1400, 600]) {
    super(scene, 'fireflies');
    scene.add.existing(this);

    this.scene = scene;
    this.count = count;
    this.bounds = bounds;
    this.center = new PhaserMath.Vector2(x, y);

    for (let i = 0; i < this.count; i++) {
      const c = new Display.Color(Math.random() * 40 + 50, Math.random() * 60 + 190, Math.random() * 20 + 10);

      const light = scene.lights.addPointLight(0, 0, c.color, Math.random() * 7 + 3, 0.15, 0.045 + r() * 0.02);
      this.lights.push(light);

      const biases = [];
      for (let i = 0; i < weights.length * 2; i++) {
        biases.push(r() * weights[i % weights.length]);
      }
      biases.push(r() * 10);

      this.biases.push(biases);
    }

    if (Config.debug) {
      this.debug = scene.add.graphics().fillStyle(0xff0000, 0.5).lineStyle(2, 0xff0000, 1);

      this.debug.fillCircle(bounds[0] / 2, bounds[1] / 2, 10);
      this.debug.strokeRect(0, 0, bounds[0], bounds[1]);
    }

    this.setPosition(x, y);
  }

  setPosition(x: number, y: number) {
    this.centers = [];

    for (let i = 0; i < this.count; i++) {
      this.centers.push(
        new PhaserMath.Vector2(
          x + Math.random() * this.bounds[0] - this.bounds[0] / 2,
          y + Math.random() * this.bounds[1] - this.bounds[1] / 2
        )
      );
    }

    if (this.debug) {
      this.debug.setPosition(x - this.bounds[0] / 2, y - this.bounds[1] / 2);
    }
  }

  update(time: number, _delta: number) {
    const near = Math.abs(this.scene.player.x - this.center.x) <= this.bounds[0];
    if (!near) return;

    const speed = 0.025;
    const t = (time / 1000) * speed;
    const cos = Math.cos(t);
    const sin = Math.sin(t);

    this.lights.forEach((light, i) => {
      const b = this.biases[i];
      const cos2 = Math.cos(t * 70 + b[10]);

      light.intensity = Math.min(0.05 + Math.abs(b[4] * cos2 + b[3] * cos + b[4] * cos) / 50, 0.4);

      light.x = cos * b[0] + sin * b[1] + cos * b[2] + sin * b[3] + cos * b[4] + this.centers[i].x;
      light.y = sin * b[5] + cos * b[6] + sin * b[7] + cos * b[8] + sin * b[9] + this.centers[i].y;
    });
  }
}
