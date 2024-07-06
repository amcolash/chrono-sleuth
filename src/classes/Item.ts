import { Player } from './Player';
import { Interactive, InteractResult, ItemType } from './types.';

export const ItemData = {
  [ItemType.Book]: { x: 100, y: 650, image: 'book' },
  [ItemType.Ring]: { x: 150, y: 875, image: 'ring' },
};

export class Item extends Phaser.Physics.Arcade.Sprite implements Interactive {
  itemType: ItemType;
  player: Player;

  constructor(scene: Phaser.Scene, type: ItemType, player: Player) {
    const { x, y, image } = ItemData[type];

    super(scene, x, y, image);
    this.itemType = type;
    this.player = player;
    this.scale = 0.35;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setPushable(false);
  }

  onInteract(keys: { [key: string]: Phaser.Input.Keyboard.Key }) {
    if (keys.SPACE.isDown || keys.ENTER.isDown) {
      this.player.inventory.addItem(this.itemType);
      this.destroy();
      return InteractResult.Item;
    }

    return InteractResult.None;
  }

  getButtonPrompt() {
    return 'Press [CONTINUE]';
  }
}
