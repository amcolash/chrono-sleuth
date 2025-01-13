import { GameObjects, Geom, Scene } from 'phaser';

import { Config } from '../../config';
import { Layer } from '../../data/layers';
import { JournalEntry } from '../../data/types';
import { Colors, getColorNumber } from '../../utils/colors';
import { hasJournalEntry } from '../../utils/interactionUtils';
import { Player } from '../Player/Player';

const radius1 = 50;
const radius2 = 40;
const radius3 = 25;

const speed = 45;
const PI2 = Math.PI * 2;

const sec = 1000 * 60;
const min = sec * 60;
const hour = min * 12;

export class ClockHands extends GameObjects.Graphics {
  player: Player;

  angle1: number = 0;
  angle2: number = 1;
  angle3: number = 4;

  update1: boolean = false;
  update2: boolean = false;
  update3: boolean = false;

  cameraBounds: Geom.Rectangle = new Geom.Rectangle(0, 0, Config.width + 300, Config.height + 300);

  constructor(scene: Scene, player: Player) {
    super(scene);
    this.name = 'ClockHands';

    scene.add.existing(this);

    this.player = player;

    this.setPosition(842, -2107);
    this.setDepth(Layer.Npcs);

    this.updateHands();
  }

  update(time: number): void {
    this.cameraBounds.x = this.scene.cameras.main.scrollX - 150;
    this.cameraBounds.y = this.scene.cameras.main.scrollY - 150;

    if (!this.cameraBounds.contains(this.x, this.y)) {
      this.setVisible(false);
      return;
    }

    this.setVisible(true);

    if (this.update1) this.angle1 = PI2 * (time / sec) * speed;
    if (this.update2) this.angle2 = PI2 * (time / min) * speed;
    if (this.update3) this.angle3 = PI2 * (time / hour) * speed;

    this.clear();

    this.fillStyle(getColorNumber('#224477'));
    this.fillCircle(0, 0, 5);

    [6, 2].forEach((width) => {
      this.lineStyle(width, getColorNumber(width === 2 ? '#4477aa' : Colors.Black));
      this.lineBetween(0, 0, Math.cos(this.angle1) * radius1, Math.sin(this.angle1) * radius1);
      this.lineBetween(0, 0, Math.cos(this.angle2) * radius2, Math.sin(this.angle2) * radius2);
      this.lineBetween(0, 0, Math.cos(this.angle3) * radius3, Math.sin(this.angle3) * radius3);
    });

    this.lineStyle(5, getColorNumber(Colors.Black));
    for (let i = 0; i < 12; i++) {
      const angle = PI2 * (i / 12);
      const x = Math.cos(angle) * radius1;
      const y = Math.sin(angle) * radius1;

      this.lineBetween(x, y, x * 1.5, y * 1.5);
    }
  }

  updateHands(): void {
    if (hasJournalEntry(this.player, JournalEntry.ClockFirstGear)) this.update1 = true;
    if (hasJournalEntry(this.player, JournalEntry.ClockSecondGear)) this.update2 = true;
  }
}
