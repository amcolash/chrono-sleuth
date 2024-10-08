import { Scene } from 'phaser';

import { Button } from '../classes/UI/Button';
import { ButtonGrid } from '../classes/UI/ButtonGrid';

export class UITest extends Scene {
  constructor() {
    super('UITest');
  }

  create() {
    this.createButtonGrid();
  }

  createButtonGrid() {
    const grid = new ButtonGrid(this);
    const buttons = [];

    const pattern = [
      [1, 1, 1, 1],
      [1, 0, 1, 1],
      [1, 1, 1, 1],
      [0, 0, 0, 1],
      [0, 0, 0, 1],
      [0, 0, 0, 1],
      [0, 0, 0, 1],
    ];

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
    return new Button(this, 50 + x * 100, 50 + y * 100, (x + y * 5).toString(), (b) => console.log(b));
  }
}
