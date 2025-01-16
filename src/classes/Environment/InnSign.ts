import { GameObjects } from 'phaser';

const speed = 0.01;
const scale = 0.5;

export class InnSign extends GameObjects.Image {
  timer: number = 0;
  target: number = 1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'inn_sign');
    scene.add.existing(this);

    this.setScale(scale);
  }

  update(): void {
    if (this.alpha < this.target) {
      this.alpha += speed;
    } else if (this.alpha > this.target) {
      this.alpha -= speed;
    }

    if (Date.now() > this.timer) {
      this.timer = Date.now() + Math.random() * 150;

      if (Math.random() > 0.8) this.timer += Math.random() * 1000;

      if (this.target === 1) this.target = 0.8;
      else this.target = 1;
    }
  }
}
