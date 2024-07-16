import { GameObjects, Scene } from 'phaser';

import { Config } from '../config';
import { Colors, getColorNumber } from '../utils/colors';
import { fontStyle } from '../utils/fonts';
import { getItem } from '../utils/interactionUtils';
import { ItemData } from './Item';
import { ItemType } from './types';

export class Inventory extends GameObjects.Container {
  inventory: ItemType[] = [];
  text: GameObjects.Text;
  rect: GameObjects.Rectangle;

  constructor(scene: Scene) {
    super(scene, 0, 0);
    this.setScrollFactor(0).setDepth(1).setVisible(false);
    scene.add.existing(this);

    this.rect = scene.add
      .rectangle(0, 0, 0, 0, getColorNumber(Colors.Teal))
      .setStrokeStyle(2, getColorNumber(Colors.White))
      .setAlpha(0.75)
      .setOrigin(0);
    this.add(this.rect);

    this.text = scene.add.text(10, 0, 'Inventory', fontStyle);
    this.add(this.text);
  }

  addItem(item: ItemType) {
    this.inventory.push(item);
    this.add(this.scene.add.sprite(0, 0, ItemData[item].image).setScale(0.35));
    this.updateItems();

    const worldItem = getItem(this.scene, item);
    if (worldItem) worldItem.destroy();
  }

  removeItem(item: ItemType) {
    const index = this.inventory.indexOf(item);
    if (index > -1) {
      this.inventory.splice(index, 1);
      this.getAll<GameObjects.Sprite>()
        .find((i) => i.texture?.key === ItemData[item].image)
        ?.destroy();
    }

    this.updateItems();
  }

  updateItems() {
    let index = 0;
    this.getAll<GameObjects.GameObject>().forEach((item) => {
      if (item instanceof GameObjects.Sprite) {
        const x = 32 + 50 * index;
        item.setPosition(x, 72);
        index++;
      }
    });
    this.setVisible(this.inventory.length > 0);

    const width = Math.max(this.text.displayWidth + 18, 50 * index + 12);
    this.setPosition(Config.width - width - 20, 20);
    this.rect.setSize(width, 104);
  }
}
