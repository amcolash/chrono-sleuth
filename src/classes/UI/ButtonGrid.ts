import { GameObjects, Math as PhaserMath, Scene, Types } from 'phaser';

import { Colors, getColorNumber } from '../../utils/colors';
import { Button } from './Button';
import { IconButton } from './IconButton';

export class ButtonGrid extends GameObjects.Container {
  buttons: (Button | IconButton | undefined)[][] = [];
  activeIndex = new PhaserMath.Vector2();

  constructor(scene: Scene, x?: number, y?: number) {
    super(scene, x, y);

    scene.add.existing(this).setScrollFactor(0);

    this.activeIndex.set(-1, -1);

    scene.input.keyboard?.on('keydown-UP', () => {
      this.setActiveButton({ x: 0, y: -1 });
    });

    scene.input.keyboard?.on('keydown-DOWN', () => {
      this.setActiveButton({ x: 0, y: 1 });
    });

    scene.input.keyboard?.on('keydown-LEFT', () => {
      this.setActiveButton({ x: -1, y: 0 });
    });

    scene.input.keyboard?.on('keydown-RIGHT', () => {
      this.setActiveButton({ x: 1, y: 0 });
    });

    scene.input.keyboard?.on('keydown-ENTER', () => {
      const button = this.getActiveButton();
      // @ts-ignore
      if (button) button.onClick(button);
    });
  }

  setButtons(buttons: (Button | IconButton | undefined)[][]) {
    this.buttons = buttons;
    this.activeIndex.set(-1, -1);
  }

  getActiveButton(): Button | IconButton | undefined {
    return this.buttons[this.activeIndex.y]?.[this.activeIndex.x];
  }

  setActiveButton(direction: Types.Math.Vector2Like) {
    let { x, y } = this.activeIndex;
    const rows = this.buttons.length;
    y = PhaserMath.Clamp(y, 0, rows - 1);
    x = PhaserMath.Clamp(x, 0, (this.buttons[y]?.length || 0) - 1);

    if (direction.x === 0) {
      let btn;

      if (this.activeIndex.y !== -1) {
        while (y >= 0 && y < rows && btn === undefined) {
          y += direction.y;
          btn = this.buttons[y]?.[x];
        }

        if (!btn) return;
      }

      x = PhaserMath.Clamp(x, 0, this.buttons[y]?.length - 1);
    }

    if (direction.y === 0 && this.activeIndex.x !== -1) {
      let btn;
      while (x >= 0 && x < this.buttons[y]?.length && btn === undefined) {
        x += direction.x;
        btn = this.buttons[y]?.[x];
      }

      if (!btn) return;
    }

    const oldActive = this.getActiveButton();
    const newActive = this.buttons[y]?.[x];

    if (newActive) {
      this.activeIndex.set(x, y);
      oldActive?.setTint(0xffffff);
      newActive?.setTint(getColorNumber(Colors.ButtonActive));
    }
  }
}
