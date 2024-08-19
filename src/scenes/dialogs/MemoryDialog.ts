import { Display, Math as PhaserMath } from 'phaser';

import { CenteredButton } from '../../classes/UI/Button';
import { ButtonGroup } from '../../classes/UI/ButtonGroup';
import { Config } from '../../config';
import { Colors, getColorNumber, getColorObject } from '../../utils/colors';
import { tweenColor } from '../../utils/util';
import { Dialog } from './Dialog';

const digits = 6;
const total = 12;

export class MemoryDialog extends Dialog {
  sequence: number[];
  pressed: number[];
  buttons: ButtonGroup;

  constructor() {
    super({ key: 'MemoryDialog', title: 'Figure out the secret code', gamepadVisible: false });
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
    const sizePadded = size * 1.3;

    for (let i = 0; i < total; i++) {
      const button = new CenteredButton(
        this,
        -sizePadded + (i % 3) * sizePadded,
        -sizePadded * 1.2 + Math.floor(i / 3) * sizePadded,
        (i + 1).toString(),
        (btn) => {
          const index = this.pressed.length;
          if (this.sequence[index] === i) {
            this.pressed.push(i);
            btn.disable();

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
            btn.disable();

            const start = new Display.Color(255, 255, 255);
            const end = getColorObject(getColorNumber(Colors.Warning));

            tweenColor(this, start, end, (color) => btn.setTint(color), {
              duration: 250,
              yoyo: true,
              onComplete: () => btn.enable(),
            });

            this.pressed = [];

            this.buttons.each((b: CenteredButton) => b.enable());
          }
        },
        { fontSize: 56 },
        { x: size, y: size },
        { x: 0.5, y: 0.5 }
      );
      this.buttons.add(button);
    }
  }

  close(success?: boolean): void {
    if (success) this.completed(() => super.close(success));
    else super.close();
  }

  completed(callback: () => void) {
    this.time.delayedCall(300, () => {
      this.buttons.getAll<CenteredButton>().forEach((b, i) => {
        const last = i === total - 1;

        const initialTint = b.tint;

        const start = getColorObject(initialTint);
        const end = getColorObject(getColorNumber(Colors.Success));

        b.disable();
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

  handleSuccess(success?: boolean): void {}
}
