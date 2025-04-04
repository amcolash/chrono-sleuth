import { GameObjects, Geom, Math as PhaserMath } from 'phaser';

import { Dialog } from './Dialog';

const Y = 40;
const PINS = 5;
const PADDING = 5;
const WIDTH = 20;
const TOTAL_HEIGHT = 150;
const SPRING_SIZE = 15;
const MIN_OFFSET = 15;
const MAX_OFFSET = 45;

export class LockpickDialog extends Dialog {
  solution: number[] = [];
  answer: number[] = [];

  offsets: number[] = [];
  target: number[] = [];
  current: number[] = [];

  pins: GameObjects.Graphics[] = [];

  constructor() {
    super({
      key: 'LockpickDialog',
      title: 'Pick the lock to open the sewer',
      gamepadVisible: false,
    });

    this.solution = [];
    this.offsets = [];

    this.answer = [];
    this.current = [];

    this.pins = [];

    for (let i = 0; i < PINS; i++) {
      this.solution.push(i);
      this.offsets.push(PhaserMath.Between(MIN_OFFSET, MAX_OFFSET));
      this.current.push(0);
    }

    // Shuffle the solution
    this.solution = this.solution.sort(() => Math.random() - 0.5);
  }

  create() {
    super.create();

    for (let i = 0; i < PINS; i++) {
      const graphics = this.add.graphics();
      this.container.add(graphics);

      graphics.setInteractive({
        draggable: true,
        hitArea: new Geom.Rectangle(
          -100 + i * 50,
          Y - TOTAL_HEIGHT + SPRING_SIZE + MIN_OFFSET,
          WIDTH,
          TOTAL_HEIGHT + this.offsets[i]
        ),
        hitAreaCallback: Geom.Rectangle.Contains,
      });

      this.input.enableDebug(graphics, 0xff0000);

      graphics.on('pointerdown', () => {
        if (this.target[i] === 0) this.target[i] = this.offsets[i];
        else this.target[i] = 0;
      });

      this.pins.push(graphics);
    }

    this.updateLayout();
  }

  updateLayout() {
    for (let i = 0; i < PINS; i++) {
      this.updatePin(i);
    }
  }

  updatePin(index: number) {
    const graphics = this.pins[index];
    graphics.clear();

    const current = this.current[index];
    const offset = this.offsets[index];

    const x = -100 + index * 50;
    const y = Y + MIN_OFFSET;

    const y1 = y - offset - 20 - PADDING + current;
    const y2 = y - offset + current;
    const y3 = y + current;

    graphics.fillStyle(0x8a6f30);
    graphics.fillRect(x, y2, WIDTH, offset);

    graphics.fillTriangle(x, y3, x + WIDTH, y3, x + WIDTH / 2, y3 + 7);

    const springStart = y - TOTAL_HEIGHT + SPRING_SIZE;
    const springEnd = y1 + 8;
    const springHeight = springEnd - springStart;

    // Draw a spring
    const coils = Math.floor((TOTAL_HEIGHT - offset - 20) / SPRING_SIZE);
    const coilHeight = springHeight / coils;

    graphics.lineStyle(3, 0x494a4a);

    for (let c = 0; c < coils; c++) {
      graphics.lineBetween(x, springStart + (c + 1) * coilHeight, x + WIDTH, springStart + c * coilHeight);
      graphics.lineBetween(x, springStart + c * coilHeight, x + WIDTH, springStart + c * coilHeight);
    }

    graphics.fillStyle(0x696a6a);
    graphics.fillRect(x, y1, WIDTH, 20);
  }

  handleSuccess(success?: boolean): void {}

  update(time: number, delta: number) {
    super.update(time, delta);

    for (let i = 0; i < PINS; i++) {
      if (this.current[i] < this.target[i]) this.current[i] += 0.5 * delta;
      else if (this.current[i] > this.target[i]) this.current[i] -= 0.5 * delta;
      if (Math.abs(this.current[i] - this.target[i]) < 1) this.current[i] = this.target[i];
    }
    this.updateLayout();
  }
}
