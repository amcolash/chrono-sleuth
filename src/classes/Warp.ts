import { Physics } from 'phaser';
import { Player } from './Player';
import { Interactive, InteractResult, WarpType } from './types.';
import { Config } from '../config';

const WarpData = {
  [WarpType.STAIRS_TOP]: { x: 300, y: 650, key: [Phaser.Input.Keyboard.KeyCodes.DOWN], warpTo: WarpType.STAIRS_BOTTOM, visible: true },
  [WarpType.STAIRS_BOTTOM]: { x: 300, y: 875, key: [Phaser.Input.Keyboard.KeyCodes.UP], warpTo: WarpType.STAIRS_TOP, visible: true },
  [WarpType.TOWN_EAST]: {
    x: 1720,
    y: 650,
    key: [Phaser.Input.Keyboard.KeyCodes.RIGHT, Phaser.Input.Keyboard.KeyCodes.D],
    warpTo: WarpType.FOREST,
    visible: false,
  },
  [WarpType.FOREST]: {
    x: 2650,
    y: 810,
    key: [Phaser.Input.Keyboard.KeyCodes.LEFT, Phaser.Input.Keyboard.KeyCodes.A],
    warpTo: WarpType.TOWN_EAST,
    visible: false,
  },
};

export class Warp extends Physics.Arcade.Sprite implements Interactive {
  id: WarpType;
  player: Player;
  interactionTimeout = 500;

  constructor(scene: Phaser.Scene, warpType: WarpType, player: Player) {
    const { x, y, visible } = WarpData[warpType];

    super(scene, x, y, 'ladder');
    this.id = warpType;
    this.player = player;
    this.scale = 0.5;
    this.visible = visible;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    if (Config.debug) this.setInteractive({ draggable: true });
  }

  onInteract(keys: { [key: string]: Phaser.Input.Keyboard.Key }) {
    let shouldWarp = false;
    const warpKeys = WarpData[this.id].key;
    Object.values(keys).forEach((key) => {
      if (key.isDown && warpKeys.includes(key.keyCode)) {
        shouldWarp = true;
      }
    });

    if (shouldWarp) {
      const { x, y } = WarpData[WarpData[this.id].warpTo];

      const targetScrollX = x - this.scene.cameras.main.width / 2;
      const targetScrollY = y - this.scene.cameras.main.height / 2;

      this.scene.cameras.main.stopFollow();
      this.scene.tweens.add({
        targets: this.scene.cameras.main,
        scrollX: targetScrollX,
        scrollY: targetScrollY,
        duration: 400,
        ease: 'Power1',
        onComplete: () => {
          this.scene.cameras.main.startFollow(this.player);
        },
      });

      // fade player out and then in again
      this.scene.tweens.add({
        targets: this.player,
        alpha: 0,
        duration: 300,
        ease: 'Power1',
        yoyo: true,
        repeat: 0,
        onYoyo: () => {
          this.player.setPosition(x, y);
        },
      });

      return InteractResult.Teleported;
    }

    return InteractResult.None;
  }

  getButtonPrompt() {
    const buttons = WarpData[this.id].key.map((key) => {
      if (key === Phaser.Input.Keyboard.KeyCodes.ENTER || key === Phaser.Input.Keyboard.KeyCodes.SPACE) return '[CONTINUE]';
      if (key === Phaser.Input.Keyboard.KeyCodes.UP || key === Phaser.Input.Keyboard.KeyCodes.W) return '[UP]';
      if (key === Phaser.Input.Keyboard.KeyCodes.DOWN || key === Phaser.Input.Keyboard.KeyCodes.S) return '[DOWN]';
      if (key === Phaser.Input.Keyboard.KeyCodes.LEFT || key === Phaser.Input.Keyboard.KeyCodes.A) return '[LEFT]';
      if (key === Phaser.Input.Keyboard.KeyCodes.RIGHT || key === Phaser.Input.Keyboard.KeyCodes.D) return '[RIGHT]';

      return '[UNKNOWN]';
    });

    const unique = [...new Set(buttons)];

    return 'Press ' + unique.join(' or ');
  }
}
