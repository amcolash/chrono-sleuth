import { GameObjects, Scene } from 'phaser';

import { Button } from './Button';
import { IconButton } from './IconButton';

export class ButtonGroup extends GameObjects.Container {
  buttons: (Button | IconButton)[] = [];
  activeIndex = -1;

  constructor(scene: Scene, x?: number, y?: number) {
    super(scene, x, y);
    scene.add.existing(this).setScrollFactor(0);

    scene.input.keyboard?.on('keydown-UP', () => {
      this.setActiveButton(Math.max(0, this.activeIndex - 1));
    });

    scene.input.keyboard?.on('keydown-DOWN', () => {
      this.setActiveButton(Math.min(this.activeIndex + 1, this.buttons.length - 1));
    });

    scene.input.keyboard?.on('keydown-ENTER', () => {
      // @ts-ignore
      this.buttons[this.activeIndex]?.onClick(this.buttons[this.activeIndex]);
    });
  }

  addButton(button: Button | IconButton) {
    this.add(button);
    this.buttons.push(button);

    if (this.buttons.length === 1) {
      this.setActiveButton(0);
    }

    button.on('pointerover', () => {
      this.setActiveButton(-1);
    });
  }

  setActiveButton(index: number) {
    this.buttons[this.activeIndex]?.setSelected(false);
    this.activeIndex = index;
    this.buttons[this.activeIndex]?.setSelected(true);
  }

  clearButtons() {
    this.buttons = [];
    this.activeIndex = -1;
    this.removeAll(true);
  }
}
