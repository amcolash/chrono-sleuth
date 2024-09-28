import { GameObjects, Input, Math as PhaserMath } from 'phaser';

import { Player } from '../../classes/Player/Player';
import { Key } from '../../classes/UI/InputManager';
import { Config } from '../../config';
import { openChest } from '../../data/cutscene';
import { Colors, getColorNumber } from '../../utils/colors';
import { fontStyle } from '../../utils/fonts';
import { Dialog } from './Dialog';

const rings = [
  [1, 0, 1, 1, 0],
  [0, 1, 0, 0, 0],
  [0, 0, 1, 0, 1],
  [0, 0, 1, 1, 0],
  [1, 1, 0, 0, 1],
];

const radius = 36;

const snapPoints = 16;
const snapThreshold = (Math.PI * 2) / snapPoints;

export class TumblerDialog extends Dialog {
  player: Player;

  angles: number[];
  rings: GameObjects.Image[] = [];

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
    this.rings = [];

    this.active = -1;
    this.nextUpdate = 0;

    this.disabled = false;

    const line = this.add
      .line(0, 30, radius * 0.75, 0, radius * 6, 0, getColorNumber(Colors.Night))
      .setOrigin(0, 0)
      .setLineWidth(5);
    this.container.add(line);

    this.container.add(
      this.add.text(
        -Config.width * 0.45,
        Config.height * 0.2,
        'Use [Left]/[Right]\nto select a ring\n\nUse [Up]/[Down]\nto rotate a ring',
        { ...fontStyle }
      )
    );

    for (let i = 0; i < rings.length; i++) {
      let angle = Math.floor(Math.random() * Math.PI * 2);
      angle = PhaserMath.Snap.To(angle, snapThreshold);
      angle = (i / 5) * Math.PI * 2;
      this.angles.push(angle);

      this.circle(i);
    }

    this.updateMarkers();
  }

  circle(index: number) {
    const center = { x: Config.width / 2, y: Config.height / 2 };

    const ring = this.add
      .image(0, 30, `ring_${index + 1}`)
      .setScale(0.8)
      .setInteractive({
        draggable: true,
        useHandCursor: true,
        pixelPerfect: true,
      })
      .on('drag', (pointer: Input.Pointer) => {
        this.active = -1;
        if (pointer.isDown) {
          this.active = index;
          const angle = PhaserMath.Angle.Between(center.x, center.y, pointer.x, pointer.y);
          this.handleMove(index, angle);
        }
      })
      .on('dragstart', (pointer: Input.Pointer) => {
        this.active = -1;
        if (pointer.isDown) {
          this.active = index;
          const angle = PhaserMath.Angle.Between(center.x, center.y, pointer.x, pointer.y);
          this.handleMove(index, angle);
        }
      })
      .on('dragend', () => {
        this.active = -1;
        this.updateMarkers(true);
      });

    this.input.enableDebug(ring);

    this.container.add(ring);
    this.rings.push(ring);
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
      const angle = PhaserMath.Snap.To(a, snapThreshold);

      if (!(Math.abs(angle - 0) < snapThreshold * 0.6 || Math.abs(angle - Math.PI * 2) < snapThreshold * 0.6)) {
        complete = false;
      }

      this.rings[i]?.setAngle(PhaserMath.RadToDeg(angle));
    });

    if (complete && checkComplete) {
      this.close(true);
    }
  }

  completed(closeHandler?: () => void) {
    this.tweens.add({
      targets: this.rings,
      rotation: 0,
      duration: 500,
      onComplete: () => {
        this.angles = [0, 0, 0, 0, 0];
        this.updateMarkers();

        this.disabled = true;
        this.active = -1;

        this.tweens.add({
          targets: this.rings,
          rotation: Math.PI * 2,
          delay: 500,
          duration: 1500,
          hold: 1000,
          onComplete: closeHandler,
        });
      },
    });
  }

  update(time: number, _delta: number): void {
    if (time < this.nextUpdate) return;
    this.nextUpdate = time + 100;

    if (!this.disabled) {
      const keys = this.keys.keys;
      if (keys[Key.Left]) {
        this.nextUpdate = time + 300;
        this.active = PhaserMath.Clamp(this.active - 1, 0, this.angles.length - 1);
      } else if (keys[Key.Right]) {
        this.nextUpdate = time + 300;
        this.active = PhaserMath.Clamp(this.active + 1, 0, this.angles.length - 1);
      } else if (keys[Key.Up]) this.handleMove(this.active, this.angles[this.active] - snapThreshold, true);
      else if (keys[Key.Down]) this.handleMove(this.active, this.angles[this.active] + snapThreshold, true);
    }

    for (let i = 0; i < 5; i++) {
      this.rings[i]?.setTint(this.active === i ? getColorNumber('C49B7C') : undefined);
    }
  }

  close(success?: boolean): void {
    if (success) this.completed(() => super.close(success));
    else super.close(success);
  }

  handleSuccess(success: boolean): void {
    if (success) openChest(this.player);
  }
}
