import { GameObjects, Geom, Math as PhaserMath } from 'phaser';

import { Player } from '../../classes/Player/Player';
import { openDialog } from '../../utils/util';
import { Dialog } from './Dialog';

const Y = 20;
const PINS = 5;
const PADDING = 5;
const WIDTH = 20;
const TOTAL_HEIGHT = 150;
const SPRING_SIZE = 15;
const MIN_OFFSET = 15;
const MAX_OFFSET = 45;
const INITIAL_TARGET = 50;

export class LockpickDialog extends Dialog {
  player: Player;

  solution: number[] = [];
  answer: number[] = [];

  offsets: number[] = [];
  target: number[] = [];
  current: number[] = [];

  pins: GameObjects.Graphics[] = [];
  active: boolean = true;

  constructor() {
    super({
      key: 'LockpickDialog',
      title: 'Pick the lock to open the sewer',
      gamepadVisible: false,
    });
  }

  init(data: { player: Player }) {
    this.player = data.player;
  }

  create() {
    super.create();

    this.solution = [];
    this.answer = [];

    this.offsets = [];
    this.target = [];
    this.current = [];

    this.pins = [];
    this.active = true;

    for (let i = 0; i < PINS; i++) {
      this.solution.push(i);
      this.offsets.push(PhaserMath.Between(MIN_OFFSET, MAX_OFFSET));
      this.current.push(0);
      this.target.push(INITIAL_TARGET);
    }

    // Shuffle the solution
    this.solution = this.solution.sort(() => Math.random() - 0.5);

    for (let i = 0; i < PINS; i++) {
      const graphics = this.add.graphics();
      this.container.add(graphics);

      const padding = 16;
      const bounds = new Geom.Rectangle(
        -100 + i * 50 - padding / 2,
        Y - TOTAL_HEIGHT + SPRING_SIZE + MIN_OFFSET - padding / 2,
        WIDTH + padding,
        TOTAL_HEIGHT + (MAX_OFFSET - this.offsets[i]) + this.offsets[i] + padding
      );

      graphics.setInteractive({
        draggable: true,
        hitArea: bounds,
        hitAreaCallback: Geom.Rectangle.Contains,
      });
      // this.input.enableDebug(graphics, 0xff0000);

      graphics.on('pointerdown', () => {
        if (!this.active) return;

        if (this.target[i] === INITIAL_TARGET) this.target[i] = this.offsets[i];
        else this.target[i] = INITIAL_TARGET;

        this.checkPins();
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

    if (index === 0) {
      graphics.lineStyle(3, 0x494a4a);
      graphics.lineBetween(-200, y - 2, 200, y - 2);
    }

    graphics.fillStyle(0xaa7f40);
    graphics.fillRect(x, y2, WIDTH, offset);

    graphics.fillTriangle(x, y3, x + WIDTH, y3, x + WIDTH / 2, y3 + 7);

    const springStart = y - TOTAL_HEIGHT + SPRING_SIZE;
    const springEnd = y1 + 8;
    const springHeight = springEnd - springStart;

    // Draw a spring
    const coils = Math.floor((TOTAL_HEIGHT - offset - 20) / SPRING_SIZE);
    const coilHeight = springHeight / coils;

    graphics.lineStyle(3, 0x696a6a);

    for (let c = 0; c < coils; c++) {
      graphics.lineBetween(x, springStart + (c + 1) * coilHeight, x + WIDTH, springStart + c * coilHeight);
      graphics.lineBetween(x, springStart + c * coilHeight, x + WIDTH, springStart + c * coilHeight);
    }

    graphics.fillStyle(0x999a9a);
    graphics.fillRect(x, y1, WIDTH, 20);
  }

  checkPins() {
    let success = true;
    for (let i = 0; i < PINS; i++) {
      if (this.target[i] !== this.offsets[i]) {
        success = false;
        break;
      }
    }

    if (success) {
      this.active = false;
      this.time.delayedCall(500, () => this.close(true));
    }
  }

  handleSuccess(success?: boolean): void {
    openDialog(this.player.scene, 'LockpickDialog');
  }

  update(time: number, delta: number) {
    super.update(time, delta);

    let changed = false;
    for (let i = 0; i < PINS; i++) {
      // this.target[i] = 50;

      if (Math.abs(this.current[i] - this.target[i]) >= 1) {
        changed = true;

        if (this.current[i] < this.target[i]) this.current[i] = Math.min(this.target[i], this.current[i] + 0.5 * delta);
        else this.current[i] = Math.max(this.target[i], this.current[i] - 0.5 * delta);
      }
    }

    if (changed) this.updateLayout();
  }
}
