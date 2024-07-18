import { GameObjects } from 'phaser';

import { Colors, getColorNumber } from '../../utils/colors';
import { Button } from './Button';

export class ButtonGroup extends GameObjects.Container {
  buttons: Button[] = [];
  activeIndex = -1;

  constructor(scene: Phaser.Scene) {
    super(scene);
    scene.add.existing(this);

    scene.input.keyboard?.on('keydown-UP', () => {
      this.setActiveButton(Math.max(0, this.activeIndex - 1));
    });

    scene.input.keyboard?.on('keydown-DOWN', () => {
      this.setActiveButton(Math.min(this.activeIndex + 1, this.buttons.length - 1));
    });

    scene.input.keyboard?.on('keydown-ENTER', () => {
      this.buttons[this.activeIndex].onClick();
    });
  }

  addButton(button: Button) {
    this.add(button);
    this.buttons.push(button);
  }

  setActiveButton(index: number) {
    this.buttons[this.activeIndex]?.setTint(0xffffff);
    this.activeIndex = index;
    this.buttons[this.activeIndex]?.setTint(getColorNumber(Colors.Tan));
  }
}
