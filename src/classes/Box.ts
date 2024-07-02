import { GameObjects, Math as PhaserMath, Scene, Time } from 'phaser';

const off = 2;
const on = 72;

const life = 6000 + Math.random() * 2500;

export class Box extends Phaser.Physics.Arcade.Sprite {
  triggered = false;
  destroyed = false;

  explodeTimer: Time.TimerEvent;
  collideTimer: Time.TimerEvent;

  bar: Phaser.GameObjects.Rectangle;
  particles: GameObjects.Particles.ParticleEmitter;

  constructor(scene: Scene, x: number, y: number, particles: GameObjects.Particles.ParticleEmitter) {
    super(scene, x, y, 'tiles', off);
    this.bar = scene.add.rectangle(x, y + this.height / 2 + 4, this.width, 6, 0x40d0d0);
    this.bar.depth = 1;

    this.particles = particles;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setPushable(false);

    this.collideTimer = scene.time.addEvent({});
    this.explodeTimer = scene.time.addEvent({});

    this.resetTimer();
  }

  update() {
    if (!this.triggered && Math.random() < 0.001 && this.collideTimer.getRemaining() === 0) {
      this.triggered = true;
      this.explodeTimer.reset({
        delay: life,
        callback: () => {
          this.particles.explode(50, this.x, this.y);
          this.destroyed = true;
        },
      });
    }

    if (this.destroyed) {
      this.setTint(0x403020);
    } else {
      this.setTint(0xffffff);
    }

    const barSize = this.explodeTimer.getRemaining() / life;

    this.bar.visible = this.triggered;
    this.bar.width = this.width * PhaserMath.Clamp(barSize, 0, 1);
    this.setFrame(this.triggered ? on : off);
  }

  removedFromScene() {
    this.bar.destroy();

    this.collideTimer.destroy();
    this.explodeTimer.destroy();
  }

  resetTimer() {
    this.collideTimer.reset({ delay: 1000 });
    this.explodeTimer.reset({});
    this.triggered = false;
  }

  onCollide(hammerCount: number): number {
    if (this.destroyed) {
      if (hammerCount > 0) {
        this.particles.explode(20, this.x, this.y);

        this.destroyed = false;
        this.resetTimer();

        hammerCount--;
      }
    } else if (this.collideTimer.getRemaining() === 0) {
      this.resetTimer();
    }

    return hammerCount;
  }
}
