import { Display, GameObjects, Math as PhaserMath, Types } from 'phaser';

import { Player } from '../../classes/Player/Player';
import { ButtonGroup } from '../../classes/UI/ButtonGroup';
import { Cursor } from '../../classes/UI/Cursor';
import { Config } from '../../config';
import { Colors, getColorNumber, getColorObject, tweenColor } from '../../utils/colors';
import { openChest } from '../../utils/cutscene';
import { Dialog } from './Dialog';

const digits = 6;
const total = 12;

export class MemoryDialog extends Dialog {
  sequence: number[];
  pressed: number[];
  buttons: ButtonGroup;
  player: Player;

  constructor() {
    super({ key: 'MemoryDialog', title: 'Figure out the secret code', gamepadVisible: false });
  }

  init(data: { player: Player }) {
    this.player = data.player;
  }

  preload() {
    this.load.setPath('assets');

    for (let i = 1; i <= 12; i++) {
      this.load.image(`rune_${i}`, `puzzles/runes/Stone${i}.png`);
    }
  }

  create(): void {
    super.create();

    this.sequence = [];
    this.pressed = [];

    while (this.sequence.length < digits) {
      const random = PhaserMath.RND.between(0, total - 1);
      if (!this.sequence.includes(random)) this.sequence.push(random);
    }

    if (!Config.prod) {
      this.container.add(
        this.add
          .text(0, Config.height * 0.43, `[ ${this.sequence.map((n) => n + 1).join(', ')} ]`, {
            fontSize: 18,
            align: 'center',
          })
          .setOrigin(0.5)
      );
    }

    this.buttons = new ButtonGroup(this);
    this.container.add(this.buttons);

    const size = Config.width / 13;
    const sizePadded = size * 1.2;

    // make double nested array of buttons
    const regions: Types.Math.Vector2Like[][] = [];

    for (let i = 0; i < total; i++) {
      const x = -sizePadded + (i % 3) * sizePadded;
      const y = -sizePadded * 1.2 + Math.floor(i / 3) * sizePadded;

      const yIndex = Math.floor(i / 3);

      if (regions[yIndex] === undefined) regions.push([]);
      regions[yIndex].push({ x, y });

      const button = this.add.image(x, y, `rune_${i + 1}`).setInteractive({ useHandCursor: true });
      button.on('pointerdown', () => this.onButtonPress(button, i));

      this.buttons.add(button);
    }

    const cursor = new Cursor(
      this,
      {
        regions,
        size: sizePadded,
        keyHandler: (pos) => {
          const index = pos.y * 3 + pos.x;
          const btn = this.buttons.getAt(index) as GameObjects.Image;

          this.onButtonPress(btn, index);
        },
      },
      this.keys
    );
    this.container.add(cursor);
  }

  onButtonPress(btn: GameObjects.Image, value: number) {
    const index = this.pressed.length;
    if (this.sequence[index] === value) {
      this.pressed.push(value);
      btn.disableInteractive();

      const start = new Display.Color(255, 255, 255);
      const end = getColorObject(getColorNumber(Colors.Success));

      tweenColor(this, start, end, (color) => btn.setTint(color), {
        duration: 250,
        onComplete: () => {
          const start = getColorObject(getColorNumber(Colors.Success));
          const end = getColorObject(0x333333);

          tweenColor(this, start, end, (color) => btn.setTint(color), {
            duration: 250,
            onComplete: () => {
              if (this.sequence.length === this.pressed.length) this.close(true);
            },
          });
        },
      });
    } else {
      btn.disableInteractive();

      const start = new Display.Color(255, 255, 255);
      const end = getColorObject(getColorNumber(Colors.Warning));

      tweenColor(this, start, end, (color) => btn.setTint(color), {
        duration: 250,
        yoyo: true,
        onComplete: () => {
          this.buttons.each((b: GameObjects.Image) => {
            b.setInteractive();
            b.setTint(0xffffff);
          });
        },
      });

      this.pressed = [];
    }
  }

  close(success?: boolean): void {
    if (success) this.completed(() => super.close(success));
    else super.close();
  }

  completed(callback: () => void) {
    this.time.delayedCall(300, () => {
      this.buttons.getAll<GameObjects.Image>().forEach((b, i) => {
        const last = i === total - 1;

        const initialTint = b.tint;

        const start = getColorObject(initialTint);
        const end = getColorObject(getColorNumber(Colors.Success));

        b.disableInteractive();
        b.setTint(initialTint);

        tweenColor(this, start, end, (color) => b.setTint(color), {
          duration: 200,
          delay: i * 70,
          hold: 500,
          onComplete: last ? callback : undefined,
        });
      });
    });
  }

  handleSuccess(success?: boolean): void {
    if (success) openChest(this.player);
  }
}
