import { Display, GameObjects, Math as PhaserMath } from 'phaser';

function r() {
  return Math.random() - 0.5;
}

const weights = [500, 200, 100, 50, 10];

export class Fireflies extends GameObjects.GameObject {
  lights: GameObjects.PointLight[] = [];
  count: number;
  centers: PhaserMath.Vector2[] = [];
  bounds: number[] = [1000, 400];
  biases: number[][] = [];

  constructor(scene: Phaser.Scene, x: number, y: number, count: number = 30, bounds: number[] = [1000, 400]) {
    super(scene, 'fireflies');
    this.scene.add.existing(this);

    this.count = count;
    this.bounds = bounds;

    for (let i = 0; i < this.count; i++) {
      const c = new Display.Color(Math.random() * 40 + 50, Math.random() * 60 + 190, Math.random() * 20 + 10);

      const light = scene.lights.addPointLight(0, 0, c.color, Math.random() * 6 + 2, 0.15);
      this.lights.push(light);
      this.centers.push(
        new PhaserMath.Vector2(
          x + Math.random() * bounds[0] - bounds[0] / 2,
          y + Math.random() * bounds[1] - bounds[1] / 2
        )
      );

      const biases = [];
      for (let i = 0; i < weights.length * 2; i++) {
        biases.push(r() * weights[i % weights.length]);
      }

      this.biases.push(biases);
    }
  }

  update(time: number, delta: number) {
    const speed = 0.025;
    const t = (time / 1000) * speed;
    const cos = Math.cos(t);
    const sin = Math.sin(t);

    const cos2 = Math.cos(t * 70);

    this.lights.forEach((light, i) => {
      const b = this.biases[i];

      light.intensity = Math.min(0.05 + Math.abs(cos2 * b[4] + b[3] * cos) / 40, 0.3);
      light.radius = Math.max(3, 3 + sin * b[4] * 2);

      light.x = cos * b[0] + sin * b[1] + cos * b[2] + sin * b[3] + cos * b[4] + this.centers[i].x;
      light.y = sin * b[5] + cos * b[6] + sin * b[7] + cos * b[8] + sin * b[9] + this.centers[i].y;
    });
  }
}
