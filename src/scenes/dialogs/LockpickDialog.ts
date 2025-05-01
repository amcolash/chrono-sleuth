import { GameObjects, Geom, Math as PhaserMath } from 'phaser';

import { Player } from '../../classes/Player/Player';
import { Key } from '../../classes/UI/InputManager';
import { Config } from '../../config';
import { fontStyle } from '../../utils/fonts';
import { openDialog } from '../../utils/util';
import { Dialog } from './Dialog';

const Y = 20;
const PINS = 5;
const HALF = PINS / 2;
const PADDING = 5;
const PIN_WIDTH = 20;
const TOTAL_WIDTH = 70;
const TOTAL_HEIGHT = 150;
const SPRING_SIZE = 15;
const MIN_OFFSET = 15;
const MAX_OFFSET = 45;
const INITIAL_TARGET = 50;

export class LockpickDialog extends Dialog {
  player: Player;

  order: number[] = [];
  answer: number[] = [];

  offsets: number[] = [];
  target: number[] = [];
  current: number[] = [];

  pins: GameObjects.Graphics[] = [];
  active: boolean = true;

  lockpick: GameObjects.Graphics;
  closest: number = 0;
  nextUpdate: number = 0;

  constructor() {
    super({
      key: 'LockpickDialog',
      title: 'Pick the lock to open the sewer',
      helpText: 'Use [Left]/[Right]\nto select a lock pin\n\n[UP]/[CONTINUE] to pick',
      gamepadVisible: false,
    });
  }

  init(data: { player: Player }) {
    this.player = data.player;
  }

  create() {
    super.create();

    this.order = [];
    this.answer = [];

    this.offsets = [];
    this.target = [];
    this.current = [];

    this.pins = [];
    this.active = true;

    this.helpText.setPosition(-this.helpText.x, this.helpText.y + 15).setOrigin(1, 0);
    this.helpText.setStyle({ ...fontStyle, align: 'right' });

    this.container.add(this.add.rectangle(0, 0, TOTAL_WIDTH * (PINS + 0.5), TOTAL_HEIGHT * 2, 0x494a4a));
    this.container.add(this.add.rectangle(0, 77, TOTAL_WIDTH * (PINS + 0.5), 90, 0x393a3a));
    this.container.add(this.add.rectangle(0, 117, TOTAL_WIDTH * (PINS + 0.5), 40, 0x292a2a));

    for (let i = 0; i < PINS; i++) {
      this.order.push(i);
      this.offsets.push(PhaserMath.Between(MIN_OFFSET, MAX_OFFSET));
      this.current.push(PhaserMath.Between(-20, 20));
      this.target.push(INITIAL_TARGET);
    }

    // Shuffle the solution
    this.order = this.order.sort(() => Math.random() - 0.5);

    for (let i = 0; i < PINS; i++) {
      const x = -(TOTAL_WIDTH * HALF) + i * TOTAL_WIDTH + PIN_WIDTH * 1.5;

      const padding = 48;
      const bounds = new Geom.Rectangle(-padding / 2, -TOTAL_HEIGHT, PIN_WIDTH + padding, TOTAL_HEIGHT * 2.5);

      this.container.add(
        this.add.rectangle(x + PIN_WIDTH / 2, 0, PIN_WIDTH + padding / 3, TOTAL_HEIGHT * 1.5, 0x292a2a)
      );

      const graphics = this.add.graphics({ x });
      this.container.add(graphics);

      if (!Config.prod) {
        this.container.add(
          this.add.text(x + 8, TOTAL_HEIGHT + 20, (this.order.indexOf(i) + 1).toString(), {
            ...fontStyle,
            fontSize: 16,
          })
        );
      }

      graphics.setInteractive({
        draggable: true,
        hitArea: bounds,
        hitAreaCallback: Geom.Rectangle.Contains,
      });
      // this.input.enableDebug(graphics, 0xff0000);

      graphics.on('pointerdown', () => this.handlePinClick(i));
      graphics.on('pointermove', () => {
        if (!this.active) return;
        this.closest = i;
      });

      this.pins.push(graphics);
    }

    this.lockpick = this.add.graphics();
    this.container.add(this.lockpick);

    this.lockpick.lineStyle(6, 0x994a7a);
    this.lockpick.lineBetween(-200, Y + 105, 200, Y + 105);
    this.lockpick.lineBetween(200, Y + 105, 225, Y + 95);
    this.lockpick.lineBetween(225, Y + 95, 225, Y + 85);

    // Start lockpick at the left
    this.lockpick.setX(-360);

    this.updateLayout(1);
  }

  updateLayout(delta: number) {
    let changed = false;
    for (let i = 0; i < PINS; i++) {
      if (Math.abs(this.current[i] - this.target[i]) >= 1) {
        changed = true;

        if (this.current[i] < this.target[i]) this.current[i] = Math.min(this.target[i], this.current[i] + 0.5 * delta);
        else this.current[i] = Math.max(this.target[i], this.current[i] - 0.5 * delta);
      }
    }

    const targetX = this.pins[this.closest].x + PIN_WIDTH / 2 - 225;
    if (Math.abs(this.lockpick.x - targetX) >= 1) {
      if (this.lockpick.x < targetX) this.lockpick.x = Math.min(targetX, this.lockpick.x + delta);
      else this.lockpick.x = Math.max(targetX, this.lockpick.x - delta);
    }

    if (changed) {
      for (let i = 0; i < PINS; i++) {
        this.updatePin(i);
      }
    }
  }

  updatePin(index: number) {
    const graphics = this.pins[index];
    graphics.clear();

    const current = this.current[index];
    const offset = this.offsets[index];

    // Pin position math
    const x = 0;
    const y = Y + MIN_OFFSET;

    const y1 = y - offset - 20 - PADDING + current;
    const y2 = y - offset + current;
    const y3 = y + current;

    // Pin body
    graphics.fillStyle(0xaa7f40);
    graphics.fillRect(x, y2, PIN_WIDTH, offset);

    // Pin tip
    graphics.fillTriangle(x, y3, x + PIN_WIDTH, y3, x + PIN_WIDTH / 2, y3 + 7);

    // Spring math
    const springStart = y - TOTAL_HEIGHT + SPRING_SIZE;
    const springEnd = y1 + 8;
    const springHeight = springEnd - springStart;

    const coils = Math.floor((TOTAL_HEIGHT - offset - 20) / SPRING_SIZE);
    const coilHeight = springHeight / coils;

    // Draw the spring
    graphics.lineStyle(3, 0x696a6a);
    for (let c = 0; c < coils; c++) {
      graphics.lineBetween(x, springStart + (c + 1) * coilHeight, x + PIN_WIDTH, springStart + c * coilHeight);
      graphics.lineBetween(x, springStart + c * coilHeight, x + PIN_WIDTH, springStart + c * coilHeight);
    }

    graphics.fillStyle(0x999a9a);
    graphics.fillRect(x, y1, PIN_WIDTH, 20);
  }

  handlePinClick(index: number) {
    if (!this.active) return;
    this.active = false;

    const correct = this.order[this.answer.length] === index;

    let firstYoyo = true;
    this.tweens.add({
      targets: this.lockpick,
      angle: -1,
      y: -14,
      duration: 100,
      yoyo: true,
      onYoyo: () => {
        if (firstYoyo) {
          if (correct) {
            this.sound.playAudioSprite('sfx', 'button');

            this.target[index] = this.offsets[index];
            this.answer.push(index);
          } else {
            this.sound.playAudioSprite('sfx', this.answer.length === 0 ? 'button' : 'safe_click');

            this.target[index] = MIN_OFFSET;
            this.answer = [];
          }

          this.checkPins();
        }

        firstYoyo = false;
      },
      onComplete: () => {
        this.lockpick.setAngle(0);
        this.lockpick.y = 0;
        this.active = true;

        if (!correct) {
          for (let i = 0; i < PINS; i++) {
            this.target[i] = INITIAL_TARGET;
          }
        }
      },
    });
  }

  checkPins() {
    let success = true;
    for (let i = 0; i < PINS; i++) {
      if (this.target[i] !== this.offsets[i]) {
        success = false;
        break;
      }
    }

    if (success) this.close(true);
  }

  handleKeys(time: number) {
    if (time < this.nextUpdate) return;

    const { keys } = this.keys;
    let moved = false;

    if (keys[Key.Left]) {
      this.closest = Math.max(0, this.closest - 1);
      moved = true;
    }

    if (keys[Key.Right]) {
      this.closest = Math.min(PINS - 1, this.closest + 1);
      moved = true;
    }

    if (keys[Key.Continue] || keys[Key.Up]) {
      this.handlePinClick(this.closest);
      moved = true;
    }

    if (moved) this.nextUpdate = time + 200;
  }

  close(success: boolean) {
    this.active = false;

    if (success) {
      for (let i = 0; i < PINS; i++) {
        this.target[i] = this.offsets[i];
      }
      this.sound.playAudioSprite('sfx', 'unlock');

      this.time.delayedCall(1000, () => super.close(true));
    } else {
      super.close(false);
    }
  }

  handleSuccess(success?: boolean): void {
    openDialog(this.player.scene, 'LockpickDialog');
  }

  update(time: number, delta: number) {
    super.update(time, delta);

    if (this.container.alpha < 1) return;
    console.log(this.lockpick.x);

    this.handleKeys(time);
    this.updateLayout(delta);
  }
}
