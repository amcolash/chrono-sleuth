import { GameObjects, Scene } from 'phaser';
import { Config } from '../config';
import { Colors, fontStyle, getColorNumber } from '../utils/colors';
import { ItemType } from './types';
import { ItemData } from './Item';

export class Inventory extends GameObjects.Container {
  inventory: ItemType[] = [];

  constructor(scene: Scene) {
    super(scene, Config.width - 320, 20);
    this.setScrollFactor(0).setDepth(1).setVisible(false);
    scene.add.existing(this);

    this.add(
      scene.add
        .rectangle(0, 0, 300, 90, getColorNumber(Colors.Teal))
        .setStrokeStyle(2, getColorNumber(Colors.White))
        .setAlpha(0.75)
        .setOrigin(0)
    );
    this.add(scene.add.text(10, 10, 'Inventory', fontStyle));
  }

  addItem(item: ItemType) {
    this.inventory.push(item);
    const x = 30 + 40 * (this.inventory.length - 1);
    this.add(this.scene.add.sprite(x, 60, ItemData[item].image).setScale(0.15));

    this.updateItems();
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
    this.getAll<GameObjects.GameObject>().forEach((item, i) => {
      if (item instanceof GameObjects.Sprite) {
        const x = 30 + 40 * index;
        item.setPosition(x, 60);
        index++;
      }
    });
    this.setVisible(this.inventory.length > 0);
  }
}
