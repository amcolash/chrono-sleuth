import { GameObjects, Math as PhaserMath } from 'phaser';

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
  circles: GameObjects.Image[] = [];

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
    this.circles = [];

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
        'Use [LEFT]/[RIGHT]\nto select a ring\n\nUse [UP]/[DOWN]\nto rotate a ring',
        { ...fontStyle }
      )
    );

    for (let i = 0; i < rings.length; i++) {
      let angle = Math.floor(Math.random() * Math.PI * 2);
      angle = PhaserMath.Snap.To(angle, snapThreshold);
      this.angles.push(angle);

      const index = rings.length - i - 1;
      this.circle(index);
    }

    this.updateMarkers();
  }

  circle(index: number) {
    const ring = this.add
      .image(Config.width / 2, Config.height / 2 + 30, `ring_${index + 1}`)
      .setScale(1.5)
      .setVisible(false);
    const metal = this.add.image(Config.width / 2, Config.height / 2 + 30, 'metal').setScale(1.5);
    metal.setMask(new Phaser.Display.Masks.BitmapMask(this, ring));

    this.container.add(metal);

    this.circles.push(metal);
    this.circles.push(ring);
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

      this.circles[i * 2].setAngle(PhaserMath.RadToDeg(angle + i * 30));
      this.circles[i * 2 + 1].setAngle(PhaserMath.RadToDeg(angle));
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

    const masks = [];
    for (let i = 0; i < 5; i++) {
      masks.push(this.circles[i * 2 + 1]);
    }

    this.tweens.add({
      targets: masks,
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
      this.circles[i * 2].setTint(this.active === i ? getColorNumber('C49B7C') : undefined);
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
