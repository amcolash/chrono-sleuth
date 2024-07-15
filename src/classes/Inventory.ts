import { GameObjects, Scene } from 'phaser';

import { Config } from '../config';
import { Colors, getColorNumber } from '../utils/colors';
import { fontStyle } from '../utils/fonts';
import { getItem } from '../utils/interactionUtils';
import { ItemData } from './Item';
import { ItemType } from './types';

export class Inventory extends GameObjects.Container {
  inventory: ItemType[] = [];

  constructor(scene: Scene) {
    super(scene, Config.width - 320, 20);
    this.setScrollFactor(0).setDepth(1).setVisible(false);
    scene.add.existing(this);

    this.add(
      scene.add
        .rectangle(0, 0, 300, 100, getColorNumber(Colors.Teal))
        .setStrokeStyle(2, getColorNumber(Colors.White))
        .setAlpha(0.75)
        .setOrigin(0)
    );
    this.add(scene.add.text(10, 0, 'Inventory', fontStyle));
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
        const x = 30 + 50 * index;
        item.setPosition(x, 70);
        index++;
      }
    });
    this.setVisible(this.inventory.length > 0);
  }
}
