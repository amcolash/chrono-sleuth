import { Types } from 'phaser';

import { Cursor } from '../../classes/UI/Cursor';
import { fontStyle } from '../../utils/fonts';
import { Dialog } from './Dialog';

const size = 80;
const cols = 3;
const topOffset = 30;

export class SliderDialog extends Dialog {
  // generate array of 16 numbers in order
  solution: number[] = Array.from({ length: cols * cols }, (_, i) => i + 1);
  layout: number[] = [...this.solution];

  tiles: Phaser.GameObjects.Text[] = [];

  constructor() {
    super({
      key: 'SliderDialog',
      title: 'Arrange the tiles to be in order.',
      gamepadVisible: false,
    });
  }

  create() {
    super.create();

    // this.layout = Phaser.Utils.Array.Shuffle(this.layout);
    this.solution[this.solution.length - 1] = 0;
    this.layout[7] = 0;
    this.layout[8] = 8;
    const regions: Types.Math.Vector2Like[][] = [];

    this.layout.forEach((value, index) => {
      const x = index % cols;
      const y = Math.floor(index / cols);

      const xPos = (x - (cols - 1) / 2) * size;
      const yPos = (y - (cols - 1) / 2) * size + topOffset;

      if (regions[y] === undefined) regions[y] = [];
      regions[y].push({ x: xPos, y: yPos });

      const tile = this.add
        .text(xPos, yPos, `${value > 0 ? value : ''}`, {
          ...fontStyle,
          fontSize: 64,
        })
        .setOrigin(0.5);

      this.container.add(tile);

      tile.setInteractive({ useHandCursor: true });
      tile.on('pointerdown', () => {
        this.moveTile(index);
      });

      this.tiles.push(tile);
    });

    const cursor = new Cursor(
      this,
      {
        regions,
        size: size * 1.1,
        keyHandler: (pos) => {
          const index = pos.y * cols + pos.x;
          this.moveTile(index);
        },
      },
      this.keys
    );
    this.container.add(cursor);

    this.updateLayout();
  }

  moveTile(index: number) {
    const emptyIndex = this.layout.indexOf(0);
    const emptyX = emptyIndex % cols;
    const emptyY = Math.floor(emptyIndex / cols);

    const x = index % cols;
    const y = Math.floor(index / cols);

    if (Math.abs(emptyX - x) + Math.abs(emptyY - y) === 1) {
      this.layout[emptyIndex] = this.layout[index];
      this.layout[index] = 0;

      this.updateLayout();
    }

    if (this.layout.join('') === this.solution.join('')) {
      this.handleSuccess(true);
    }
  }

  updateLayout() {
    this.layout.forEach((value, index) => {
      this.tiles[index].setText(`${value > 0 ? value : ''}`);
    });
  }

  handleSuccess(success?: boolean): void {
    if (success) {
      this.time.delayedCall(500, () => {
        this.close(true);
      });
    }
  }
}
