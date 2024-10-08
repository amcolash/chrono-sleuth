import { GameObjects, Scene } from 'phaser';

import { Button } from '../classes/UI/Button';
import { ButtonGrid } from '../classes/UI/ButtonGrid';

const pattern = [
  [1, 1, 1, 1],
  [1, 0, 1, 1],
  [1, 1, 1, 1],
  [0, 0, 0, 1],
  [0, 0, 0, 1],
  [0, 0, 0, 1],
  [0, 0, 0, 1],
  [0, 0, 0, 1],
];

const answer = [
  [0, 1, 2],
  [3, ' ', 4],
  [5, 6, 7],
];

export class UITest extends Scene {
  selected?: Button;
  cursor: GameObjects.Rectangle;

  constructor() {
    super('UITest');
    this.selected = undefined;
  }

  create() {
    const grid = new ButtonGrid(this);
    const buttons = [];

    for (let y = 0; y < pattern.length; y++) {
      const row = [];
      for (let x = 0; x < pattern[y].length; x++) {
        if (pattern[y][x]) row.push(this.btn(x, y));
        else row.push(undefined);
      }
      buttons.push(row);
    }

    grid.setButtons(buttons);
  }

  btn(x: number, y: number): Button {
    let xOffset = x < 3 ? 0 : 100;
    return new Button(this, 50 + x * 60 + xOffset, 50 + y * 85, x < 3 ? ' ' : y.toString(), (b) =>
      this.selectButton(b)
    );
  }

  selectButton(b: Button) {
    if (this.selected === undefined) {
      this.selected = b;
      b.setSelected(true);
    } else {
      const old = this.selected.text;

      this.selected.setSelected(false);
      this.selected.text = b.text;
      b.text = old;

      this.selected = undefined;
    }
  }
}
