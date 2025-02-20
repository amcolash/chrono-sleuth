import { Types } from 'phaser';

import { Cursor } from '../../classes/UI/Cursor';
import { Config } from '../../config';
import { Dialog } from './Dialog';

export const cols = 3;

const size = Config.height / (Config.zoomed ? 4 : 5.5);
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

  preload() {
    this.load.setPath('assets');

    const puzzleSize = Math.floor(512 / cols);
    this.load.spritesheet('slider', 'puzzles/slider.jpg', { frameWidth: puzzleSize, frameHeight: puzzleSize });
  }

  create() {
    super.create();
    const regions: Types.Math.RectangleLike[][] = [];

    this.solution = Array.from({ length: cols * cols }, (_, i) => i);
    this.layout = [...this.solution];
    this.tiles = [];

    // shuffle the layout
    for (let i = this.layout.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.layout[i], this.layout[j]] = [this.layout[j], this.layout[i]];
    }

    this.layout.forEach((_value, index) => {
      const x = index % cols;
      const y = Math.floor(index / cols);

      const xPos = (x - (cols - 1) / 2) * size;
      const yPos = (y - (cols - 1) / 2) * size + topOffset;

      if (regions[y] === undefined) regions[y] = [];
      regions[y].push({ x: xPos, y: yPos, width: size * 1.1, height: size * 1.1 });

      const tile = this.add
        .image(xPos, yPos, 'slider', index)
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

      this.sound.playAudioSprite('sfx', 'puzzle_slide', { volume: 0.5 });

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

  completed(closeHandler: () => void): void {
    for (let i = 0; i < this.layout.length + 1; i++) {
      this.time.delayedCall(i * 150, () => {
        if (i < this.layout.length) {
          this.tiles[i].setFrame(i);
          this.tiles[i].setVisible(i != emptyTile);
        }

        if (i > 0) this.tiles[i - 1].setTint(0x666666);
      });
    }

    this.time.delayedCall(2000, closeHandler);
  }

  close(success?: boolean): void {
    if (success) this.completed(() => super.close(success));
    else super.close(success);
  }

  handleSuccess(success?: boolean): void {
    if (success) {
      this.time.delayedCall(750, () => {
        this.close(true);
      });
    }
  }
}
