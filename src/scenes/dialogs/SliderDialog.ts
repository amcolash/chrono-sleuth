import { Types } from 'phaser';

import { Cursor } from '../../classes/UI/Cursor';
import { Dialog } from './Dialog';

export const cols = 3;

const size = 100;
const topOffset = 30;
const emptyTile = cols * cols - 1;

export class SliderDialog extends Dialog {
  solution: number[] = [];
  layout: number[] = [];

  tiles: Phaser.GameObjects.Image[] = [];

  constructor() {
    super({
      key: 'SliderDialog',
      title: 'Arrange the tiles to be in order.',
      gamepadVisible: false,
    });
  }

  create() {
    super.create();
    const regions: Types.Math.Vector2Like[][] = [];

    this.solution = Array.from({ length: cols * cols }, (_, i) => i);
    this.layout = [...this.solution];
    this.tiles = [];

    this.layout[7] = 8;
    this.layout[8] = 7;

    this.layout.forEach((_value, index) => {
      const x = index % cols;
      const y = Math.floor(index / cols);

      const xPos = (x - (cols - 1) / 2) * size;
      const yPos = (y - (cols - 1) / 2) * size + topOffset;

      if (regions[y] === undefined) regions[y] = [];
      regions[y].push({ x: xPos, y: yPos });

      const tile = this.add
        .image(xPos, yPos, 'puzzle', index)
        .setOrigin(0.5)
        .setDisplaySize(size * 0.95, size * 0.95);

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
    const emptyIndex = this.layout.indexOf(emptyTile);
    const emptyX = emptyIndex % cols;
    const emptyY = Math.floor(emptyIndex / cols);

    const x = index % cols;
    const y = Math.floor(index / cols);

    if (Math.abs(emptyX - x) + Math.abs(emptyY - y) === 1) {
      this.layout[emptyIndex] = this.layout[index];
      this.layout[index] = emptyTile;

      this.updateLayout();
    }

    if (this.layout.join('') === this.solution.join('')) {
      this.handleSuccess(true);
    }
  }

  updateLayout() {
    this.layout.forEach((value, index) => {
      this.tiles[index].setFrame(value);
      this.tiles[index].setVisible(value != emptyTile);
    });
  }

  handleSuccess(success?: boolean): void {
    if (success) {
      this.time.delayedCall(750, () => {
        this.close(true);
      });
    }
  }
}
