import { Display, GameObjects, Math as PhaserMath } from 'phaser';

function r() {
  return Math.random() - 0.5;
}

const weights = [500, 200, 100, 50, 10];
const bounds = [1000, 400];

export class Fireflies extends GameObjects.GameObject {
  center: PhaserMath.Vector2[] = [];
  lights: GameObjects.PointLight[] = [];
  biases: number[][] = [];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, 'fireflies');
    this.scene.add.existing(this);

    for (let i = 0; i < 20; i++) {
      const c = new Display.Color(Math.random() * 40 + 80, Math.random() * 60 + 190, 0);

      const light = scene.lights.addPointLight(0, 0, c.color, 7, 0.15);
      this.lights.push(light);
      this.center.push(
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

    this.lights.forEach((light, i) => {
      // light.intensity = 0.15 + Math.random() * 0.05;
      // light.radius = 6 + Math.random() * 2;
      // light.color = Display.Color.RandomRGB(0.6 + Math.random() * 0.4, 0.6 + Math.random() * 0.4, 0);

      const b = this.biases[i];

      light.intensity = PhaserMath.Clamp(0.15 + (cos * b[4]) / 5, 0.1, 0.3);
      light.radius = 6 + (sin * b[4]) / 2;

      light.x = cos * b[0] + sin * b[1] + cos * b[2] + sin * b[3] + cos * b[4] + this.center[i].x;
      light.y = sin * b[5] + cos * b[6] + sin * b[7] + cos * b[8] + sin * b[9] + this.center[i].y;

      // light.x += Math.random() - 0.5;
      // light.y += Math.random() - 0.5;

      // // clamp to +/- 50px from initial x/y
      // light.x = PhaserMath.Clamp(light.x, this.center.x - 100, this.center.x + 100);
      // light.y = PhaserMath.Clamp(light.y, this.center.y - 100, this.center.y + 100);
    });
  }
}
