import { GameObjects, Scene } from 'phaser';

import { Config } from '../../config';
import { ItemData } from '../../data/item';
import { Layer } from '../../data/layers';
import { ItemType } from '../../data/types';
import { Colors, getColorNumber } from '../../utils/colors';
import { fontStyle } from '../../utils/fonts';
import { getItem } from '../../utils/interactionUtils';
import { Notification } from '../UI/Notification';

export interface InventoryData {
  type: ItemType;
  used: boolean;
}

export class Inventory extends GameObjects.Container {
  inventory: InventoryData[] = [];
  text: GameObjects.Text;
  rect: GameObjects.Rectangle;

  constructor(scene: Scene) {
    super(scene, 0, 0);
    this.setScrollFactor(0).setDepth(Layer.Ui).setVisible(false);
  }

  createUI() {
    this.scene.add.existing(this);

    this.rect = this.scene.add
      .rectangle(0, 0, 0, 0, getColorNumber(Colors.Teal))
      .setStrokeStyle(2, getColorNumber(Colors.White))
      .setAlpha(0.75)
      .setOrigin(0);
    this.add(this.rect);

    this.text = this.scene.add.text(10, 4, 'Inventory', { ...fontStyle, fontSize: 32 });
    this.add(this.text);
  }

  addItem(item: InventoryData, silent?: boolean) {
    if (!this.text) this.createUI();

    this.inventory.push(item);

    if (!item.used) {
      const i = this.scene.add.image(0, 0, ItemData[item.type].image).setScale(0.35);
      if (item.type === ItemType.Key) i.setAngle(45);
      this.add(i);
    }

    this.updateItems();

    const worldItem = getItem(this.scene, item.type);
    worldItem?.destroy();

    if (!silent) new Notification(this.scene, `New item added: ${ItemData[item.type].name}`);
  }

  removeItem(item: ItemType) {
    const found = this.inventory.find((i) => i.type === item);
    if (found) {
      found.used = true;

      this.getAll<GameObjects.Image>()
        .find((i) => i.texture?.key === ItemData[item].image)
        ?.destroy();
    }

    this.updateItems();
  }

  updateItems() {
    if (!this.text) this.createUI();

    let index = 0;
    this.getAll<GameObjects.GameObject>().forEach((item) => {
      if (item instanceof GameObjects.Image) {
        const x = 32 + 50 * index;
        item.setPosition(x, 68);
        index++;
      }
    });
    this.setVisible(this.inventory.length > 0);

    const width = Math.max(this.text?.displayWidth + 18, 50 * index + 12);
    this.setPosition(Config.width - width - 20, 20);
    this.rect.setSize(width, 102);
  }
}