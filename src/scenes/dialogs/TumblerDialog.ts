import { GameObjects, Input, Math as PhaserMath } from 'phaser';

import { Player } from '../../classes/Player/Player';
import { Key } from '../../classes/UI/InputManager';
import { Config } from '../../config';
import { openChest } from '../../data/cutscene';
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
  player: Player;

  angles: number[];
  markers: GameObjects.Arc[];
  markerContainer: GameObjects.Container;

  active: number;
  nextUpdate: number;

  disabled: boolean;

  constructor() {
    super({ key: 'TumblerDialog', title: 'Open the lock by aligning all rings', gamepadVisible: false });
  }

  init(data: { player: Player }) {
    this.player = data.player;
  }

  create(): void {
    super.create();

    this.angles = [];
    this.markers = [];

    this.active = -1;
    this.nextUpdate = 0;

    this.disabled = false;

    this.markerContainer = this.add.container(offset.x, offset.y);

    const line = this.add
      .line(0, 0, radius, 0, radius * 5, 0, getColorNumber(Colors.Tan))
      .setOrigin(0, 0)
      .setLineWidth(5);
    this.markerContainer.add(line);

    const center = { x: Config.width / 2, y: Config.height / 2 };

    for (let i = 0; i < rings.length; i++) {
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
    }

    this.container.add(this.markerContainer);
    this.updateMarkers();
  }

  handleMove(index: number, angle: number, checkComplete?: boolean) {
    if (this.disabled) return;

    const movement = this.angles[index] - angle;
    this.angles[index] = angle % (Math.PI * 2);

    rings[index]?.forEach((r, j) => {
      if (j !== index) this.angles[j] = (this.angles[j] + r * movement) % (Math.PI * 2);
    });

    this.updateMarkers(checkComplete);
  }

  updateMarkers(checkComplete?: boolean) {
    let complete = true;

    this.angles.forEach((a, i) => {
      const distance = radius + radius * i;

      const angle = PhaserMath.Snap.To(a, snapThreshold);

      if (!(Math.abs(angle - 0) < snapThreshold * 0.6 || Math.abs(angle - Math.PI * 2) < snapThreshold * 0.6)) {
        complete = false;
      }

      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      this.markers[i].setPosition(x, y);
    });

    if (complete && checkComplete) {
      this.close(true);
    }
  }

  completed(closeHandler?: () => void) {
    this.angles = [0, 0, 0, 0, 0];
    this.updateMarkers();

    this.disabled = true;
    this.active = -1;
    this.markers.forEach((m) => m.setStrokeStyle(4, getColorNumber(Colors.Tan)));

    this.tweens.add({
      targets: this.markerContainer,
      rotation: Math.PI * 2,
      delay: 500,
      duration: 1500,
      hold: 1000,
      onComplete: closeHandler,
    });
  }

  update(time: number, _delta: number): void {
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

  close(success?: boolean): void {
    if (success) this.completed(() => super.close(success));
    else super.close(success);
  }

  handleSuccess(success: boolean): void {
    if (success) openChest(this.player);
  }
}
