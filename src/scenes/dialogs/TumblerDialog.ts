import { GameObjects, Input, Math as PhaserMath } from 'phaser';

import { Key } from '../../classes/UI/InputManager';
import { Config } from '../../config';
import { Colors, getColorNumber } from '../../utils/colors';
import { Dialog } from './Dialog';

const rings = [
  [1, 0, 1, 1, 0],
  [0, 1, 0, 0, 0],
  [0, 0, 1, 0, 1],
  [0, 0, 1, 1, 0],
  [1, 1, 0, 0, 1],
];

const offset = { x: 0, y: 30 };
const radius = 36;

const snapPoints = 16;
const snapThreshold = (Math.PI * 2) / snapPoints;

export class TumblerDialog extends Dialog {
  angles: number[] = [];
  markers: GameObjects.Arc[] = [];
  markerContainer: GameObjects.Container;

  active: number = -1;
  nextUpdate: number = 0;

  disabled: boolean = false;

  constructor() {
    super({ key: 'TumblerDialog', title: 'Open the lock by aligning all rings', gamepadVisible: false });
  }

  create(): void {
    super.create();

    this.markerContainer = this.add.container(offset.x, offset.y);

    const line = this.add
      .line(0, 0, radius, 0, radius * 5, 0, getColorNumber(Colors.Tan))
      .setOrigin(0, 0)
      .setLineWidth(5);
    this.markerContainer.add(line);

    const center = { x: Config.width / 2, y: Config.height / 2 };

    rings.forEach((r, i) => {
      let angle = Math.floor(Math.random() * Math.PI * 2);
      angle = PhaserMath.Snap.To(angle, snapThreshold);
      this.angles.push(angle);

      const index = rings.length - i - 1;

      const circle = this.add
        .circle(offset.x, offset.y, radius + radius * index)
        .setStrokeStyle(4, getColorNumber(Colors.Night));

      this.container.add(circle);

      const marker = this.add
        .circle(0, 0, 8)
        .setStrokeStyle(4, getColorNumber(Colors.Tan))
        .setInteractive({ draggable: true })
        .on('drag', (pointer: Input.Pointer) => {
          this.active = -1;
          if (pointer.isDown) {
            const angle = PhaserMath.Angle.Between(center.x, center.y, pointer.x, pointer.y);
            this.handleMove(i, angle);
          }
        })
        .on('dragstart', (pointer: Input.Pointer) => {
          this.active = -1;
          if (pointer.isDown) {
            const angle = PhaserMath.Angle.Between(center.x, center.y, pointer.x, pointer.y);
            this.handleMove(i, angle);
          }
        })
        .on('dragend', () => {
          this.active = -1;
          this.updateMarkers(true);
        });
      this.markers.push(marker);

      this.markerContainer.add(marker);
    });

    this.container.add(this.markerContainer);
    this.updateMarkers();

    if (import.meta.env.DEV) {
      this.input.keyboard?.on('keydown-L', () => {
        this.angles = [0, 0, 0, 0, 0];
        this.updateMarkers();
        this.completed();
      });
    }
  }

  handleMove(index: number, angle: number, checkComplete?: boolean) {
    if (this.disabled) return;

    const movement = this.angles[index] - angle;
    this.angles[index] = angle;

    rings[index].forEach((r, j) => {
      if (j !== index) this.angles[j] += r * movement;
    });

    this.updateMarkers(checkComplete);
  }

  updateMarkers(checkComplete?: boolean) {
    let complete = true;

    this.angles.forEach((a, i) => {
      const distance = radius + radius * i;

      const angle = PhaserMath.Snap.To(a, snapThreshold);

      if (!(Math.abs(angle - 0) < snapThreshold / 2 || Math.abs(angle - Math.PI * 2) < snapThreshold / 2)) {
        complete = false;
      }

      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      this.markers[i].setPosition(x, y);
    });

    if (complete && checkComplete) {
      this.completed();
    }
  }

  completed() {
    this.disabled = true;
    this.active = -1;
    this.markers.forEach((m) => m.setStrokeStyle(4, getColorNumber(Colors.Tan)));

    this.tweens.add({
      targets: this.markerContainer,
      rotation: Math.PI * 2,
      delay: 500,
      duration: 1500,
      hold: 1000,
      onComplete: () => this.close(true),
    });
  }

  update(time: number, delta: number): void {
    if (time < this.nextUpdate) return;
    this.nextUpdate = time + 100;

    if (!this.disabled) {
      const keys = this.keys.keys;
      if (keys[Key.Left]) this.active = PhaserMath.Clamp(this.active - 1, 0, this.angles.length - 1);
      else if (keys[Key.Right]) this.active = PhaserMath.Clamp(this.active + 1, 0, this.angles.length - 1);
      else if (keys[Key.Up]) this.handleMove(this.active, this.angles[this.active] - snapThreshold, true);
      else if (keys[Key.Down]) this.handleMove(this.active, this.angles[this.active] + snapThreshold, true);
    }

    this.markers.forEach((m, i) => {
      m.setFillStyle(i === this.active ? getColorNumber(Colors.Peach) : undefined);
      m.setScale(i === this.active ? 1.3 : 1);
    });
  }

  handleSuccess(): void {}
}
