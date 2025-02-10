import { GameObjects, Scene } from 'phaser';

import { Layer } from '../../data/layers';
import { Colors, getColorNumber } from '../../utils/colors';

export class IconButton extends GameObjects.Container {
  onClick: () => void;
  img: GameObjects.Image;
  rect: GameObjects.Rectangle;
  selected: boolean;

  constructor(scene: Scene, x: number, y: number, texture: string, onClick: () => void) {
    super(scene, x, y);
    scene.add.existing(this);
    this.setScrollFactor(0).setDepth(Layer.Ui);

    this.rect = scene.add
      .rectangle(0, 0, 42, 42, getColorNumber(Colors.Slate))
      .setScrollFactor(0)
      .setStrokeStyle(2, getColorNumber(Colors.Black));
    this.img = scene.add.image(-1, 1, 'icons', texture).setDisplaySize(32, 32);
    this.add(this.rect);
    this.add(this.img);

    this.onClick = () => {
      scene.sound.playAudioSprite('sfx', 'button');
      onClick();
    };

    this.rect.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.onClick());

    this.selected = false;

    this.rect.on('pointerover', () => {
      this.rect.setScale(1.1);
      this.img.setDisplaySize(36, 36);
    });
    this.rect.on('pointerout', () => {
      this.rect.setScale(1);
      this.img.setDisplaySize(32, 32);
    });
  }

  setTint(tint: number) {
    this.img.setTint(tint);
  }

  setSelected(selected: boolean) {
    this.selected = selected;
    this.setTint(selected ? getColorNumber(Colors.ButtonActive) : 0xffffff);
  }

  setIcon(texture: string) {
    this.img.setTexture('icons', texture).setDisplaySize(32, 32);
  }
}
