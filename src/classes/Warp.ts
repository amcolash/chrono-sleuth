import { Player } from './Player';
import { Interactive, InteractResult, WarpType } from './types.';

const meta = {
  [WarpType.STAIRS_TOP]: { x: 300, y: 650, key: [Phaser.Input.Keyboard.KeyCodes.DOWN], warpTo: WarpType.STAIRS_BOTTOM, visible: true },
  [WarpType.STAIRS_BOTTOM]: { x: 300, y: 875, key: [Phaser.Input.Keyboard.KeyCodes.UP], warpTo: WarpType.STAIRS_TOP, visible: true },
  [WarpType.TOWN_EAST]: {
    x: 1720,
    y: 650,
    key: [Phaser.Input.Keyboard.KeyCodes.ENTER, Phaser.Input.Keyboard.KeyCodes.SPACE],
    warpTo: WarpType.FOREST,
    visible: false,
  },
  [WarpType.FOREST]: {
    x: 2350,
    y: 810,
    key: [Phaser.Input.Keyboard.KeyCodes.ENTER, Phaser.Input.Keyboard.KeyCodes.SPACE],
    warpTo: WarpType.TOWN_EAST,
    visible: false,
  },
};

export class Warp extends Phaser.Physics.Arcade.Sprite implements Interactive {
  id: WarpType;
  player: Player;
  interactionTimeout = 500;

  constructor(scene: Phaser.Scene, warpType: WarpType, player: Player) {
    const { x, y, visible } = meta[warpType];

    super(scene, x, y, 'ladder');
    this.id = warpType;
    this.player = player;
    this.scale = 0.5;
    this.visible = visible;

    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  onInteract(keys: { [key: string]: Phaser.Input.Keyboard.Key }) {
    let shouldWarp = false;
    const warpKeys = meta[this.id].key;
    Object.values(keys).forEach((key) => {
      if (key.isDown && warpKeys.includes(key.keyCode)) {
        shouldWarp = true;
      }
    });

    if (shouldWarp) {
      const { x, y } = meta[meta[this.id].warpTo];
      this.player.x = x;
      this.player.y = y;

      return InteractResult.Teleported;
    }

    return InteractResult.None;
  }

  getButtonPrompt() {
    const buttons = meta[this.id].key.map((key) => {
      if (key === Phaser.Input.Keyboard.KeyCodes.ENTER || key === Phaser.Input.Keyboard.KeyCodes.SPACE) return 'CONTINUE';
      if (key === Phaser.Input.Keyboard.KeyCodes.UP) return 'UP';
      if (key === Phaser.Input.Keyboard.KeyCodes.DOWN) return 'DOWN';

      return 'UNKNOWN';
    });

    const unique = [...new Set(buttons)];

    return 'Press ' + unique.join(' or ');
  }
}
