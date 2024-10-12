import { GameObjects, Scene } from 'phaser';

import { Button } from '../classes/UI/Button';
import { ButtonGrid } from '../classes/UI/ButtonGrid';

const pattern = [
  [1, 1, 1, 0, 1],
  [1, 0, 1, 0, 1],
  [1, 1, 1, 0, 1],
  [0, 0, 0, 0, 1],
  [0, 0, 0, 0, 1],
  [0, 0, 0, 0, 1],
  [0, 0, 0, 0, 1],
  [0, 0, 0, 0, 1],
];

const answer = [
  ['0', '1', '2'],
  ['3', ' ', '4'],
  ['5', '6', '7'],
];

export class UITest extends Scene {
  selected?: Button;
  cursor: GameObjects.Rectangle;
  grid: ButtonGrid;

  constructor() {
    super('UITest');
    this.selected = undefined;
  }

  create() {
    const buttons: (Button | undefined)[][] = [];

    for (let y = 0; y < pattern.length; y++) {
      const row = [];
      for (let x = 0; x < pattern[y].length; x++) {
        if (pattern[y][x]) row.push(this.btn(x, y));
        else row.push(undefined);
      }
      buttons.push(row);
    }

    this.grid = new ButtonGrid(this);
    this.grid.setButtons(buttons);

    this.input.keyboard?.on('keydown-BACK_SLASH', () => {
      (buttons[0][0] as Button).text = '0';
      (buttons[0][1] as Button).text = '1';
      (buttons[0][2] as Button).text = '2';

      (buttons[1][0] as Button).text = '3';
      (buttons[1][2] as Button).text = '4';

      (buttons[2][0] as Button).text = '5';
      (buttons[2][1] as Button).text = '6';

      (buttons[0][4] as Button).text = ' ';
      (buttons[1][4] as Button).text = ' ';
      (buttons[2][4] as Button).text = ' ';
      (buttons[3][4] as Button).text = ' ';
      (buttons[4][4] as Button).text = ' ';
      (buttons[5][4] as Button).text = ' ';
      (buttons[6][4] as Button).text = ' ';
    });
  }

  btn(x: number, y: number): Button {
    return new Button(this, 50 + x * 60, 50 + y * 85, x < 3 ? ' ' : y.toString(), (b) => this.selectButton(b));
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

      const valid = this.checkValid();
      if (valid) console.log('You Won!');
    }
  }

  checkValid(): boolean {
    let valid = true;
    for (let y = 0; y < answer.length; y++) {
      for (let x = 0; x < answer[0].length; x++) {
        const button = this.grid.buttons[y]?.[x];
        if (!button) continue;
        if ((button as Button).text !== answer[y][x]) {
          valid = false;
        }
      }
    }

    return valid;
  }
}
