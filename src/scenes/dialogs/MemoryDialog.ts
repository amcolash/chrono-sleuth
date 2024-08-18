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

    console.log(this.sequence.map((n) => n + 1));

    const buttonGroup = new ButtonGroup(this);
    this.container.add(buttonGroup);

    const size = Config.width / 14;
    const sizePadded = size * 1.3;

    for (let i = 0; i < total; i++) {
      const button = new CenteredButton(
        this,
        -sizePadded + (i % 3) * sizePadded,
        -sizePadded + Math.floor(i / 3) * sizePadded,
        (i + 1).toString(),
        (btn) => {
          const index = this.pressed.length;
          if (this.sequence[index] === i) {
            this.pressed.push(i);
            btn.disable();

            const start = new Display.Color(255, 255, 255);
            const end = getColorObject(0x33aa33);

            tweenColor(this, start, end, (color) => btn.setTint(color), {
              duration: 250,
              yoyo: true,
              onComplete: () => btn.setTint(0x333333),
            });

            if (this.sequence.length === this.pressed.length) {
              this.close(true);
            }
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

            buttonGroup.each((b: CenteredButton) => b.enable());
          }
        },
        { fontSize: 56 },
        { x: size, y: size },
        { x: 0.5, y: 0.5 }
      );
      buttonGroup.add(button);
    }
  }

  handleSuccess(success?: boolean): void {}
}
