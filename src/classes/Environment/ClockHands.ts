import { GameObjects, Scene } from 'phaser';

import { Config } from '../../config';
import { Layer } from '../../data/layers';
import { JournalEntry } from '../../data/types';
import { Colors, getColorNumber } from '../../utils/colors';
import { hasJournalEntry } from '../../utils/interactionUtils';
import { nearby } from '../../utils/util';
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
  small: boolean;

  angle1: number = 0;
  angle2: number = 1;
  angle3: number = 4;

  update1: boolean = false;
  update2: boolean = false;
  update3: boolean = false;

  constructor(scene: Scene, player: Player, small: boolean = false) {
    super(scene);
    this.name = 'ClockHands';

    scene.add.existing(this);

    this.player = player;

    const x = small ? 897 : 842;
    const y = small ? 247 : -2107;

    this.setPosition(x, y);
    this.setDepth(Layer.Npcs);

    this.updateHands();

    this.small = small;
  }

  update(time: number): void {
    if (!nearby(this, this.player, Config.width / 1.5)) return;

    if (this.update1) this.angle1 = PI2 * (time / sec) * speed;
    if (this.update2) this.angle2 = PI2 * (time / min) * speed;
    if (this.update3) this.angle3 = PI2 * (time / hour) * speed;

    this.clear();

    this.fillStyle(getColorNumber('#224477'));
    this.fillCircle(0, 0, 5);

    const scale = this.small ? 0.4 : 1;
    const scale2 = this.small ? 1.35 : 1;
    const scale3 = this.small ? 0.7 : 1;

    const large = this.small ? 4 : 6;
    const small = this.small ? 1 : 2;

    [large, small].forEach((width) => {
      this.lineStyle(width, getColorNumber(width === small ? '#4477aa' : Colors.Black));
      this.lineBetween(0, 0, Math.cos(this.angle1) * radius1 * scale, Math.sin(this.angle1) * radius1 * scale);
      this.lineBetween(0, 0, Math.cos(this.angle2) * radius2 * scale, Math.sin(this.angle2) * radius2 * scale);
      this.lineBetween(
        0,
        0,
        Math.cos(this.angle3) * radius3 * scale * scale2,
        Math.sin(this.angle3) * radius3 * scale * scale2
      );
    });

    this.lineStyle(this.small ? 3 : 5, getColorNumber(Colors.Black));
    for (let i = 0; i < 12; i++) {
      const angle = PI2 * (i / 12);
      const x = Math.cos(angle) * radius1 * scale * scale3;
      const y = Math.sin(angle) * radius1 * scale * scale3;

      this.lineBetween(x, y, x * 1.5, y * 1.5);
    }
  }

  updateHands(): void {
    if (hasJournalEntry(this.player, JournalEntry.ClockFirstGear)) this.update1 = true;
    if (hasJournalEntry(this.player, JournalEntry.ClockSecondGear)) this.update2 = true;
  }
}
