import { BlendModes, GameObjects, Physics } from 'phaser';

import { Config } from '../config';
import { Colors, getColorNumber } from '../utils/colors';
import { Player } from './Player';
import { InteractResult, Interactive, WarpType } from './types';

const WarpData = {
  [WarpType.Town]: {
    x: 300,
    y: 650,
    key: [Phaser.Input.Keyboard.KeyCodes.DOWN],
    warpTo: WarpType.Underground,
    visible: true,
  },
  [WarpType.Underground]: {
    x: 301,
    y: 875,
    key: [Phaser.Input.Keyboard.KeyCodes.UP],
    warpTo: WarpType.Town,
    visible: true,
  },

  [WarpType.TownEast]: {
    x: 1720,
    y: 650,
    key: [Phaser.Input.Keyboard.KeyCodes.RIGHT, Phaser.Input.Keyboard.KeyCodes.D],
    warpTo: WarpType.Forest,
    visible: false,
  },
  [WarpType.Forest]: {
    x: 2650,
    y: 810,
    key: [Phaser.Input.Keyboard.KeyCodes.LEFT, Phaser.Input.Keyboard.KeyCodes.A],
    warpTo: WarpType.TownEast,
    visible: false,
  },

  [WarpType.TownNorth]: {
    x: 775,
    y: 650,
    key: [Phaser.Input.Keyboard.KeyCodes.UP],
    warpTo: WarpType.ClockSquare,
    visible: false,
  },
  [WarpType.ClockSquare]: {
    x: 720,
    y: -330,
    key: [Phaser.Input.Keyboard.KeyCodes.DOWN],
    warpTo: WarpType.TownNorth,
    visible: false,
  },

  [WarpType.ClockSquareNorth]: {
    x: 915,
    y: -330,
    key: [Phaser.Input.Keyboard.KeyCodes.UP],
    warpTo: WarpType.ClockEntrance,
    visible: false,
  },
  [WarpType.ClockEntrance]: {
    x: 900,
    y: -1320,
    key: [Phaser.Input.Keyboard.KeyCodes.DOWN],
    warpTo: WarpType.ClockSquareNorth,
    visible: false,
  },

  [WarpType.ClockStairs]: {
    x: 735,
    y: -1320,
    key: [Phaser.Input.Keyboard.KeyCodes.UP],
    warpTo: WarpType.ClockTop,
    visible: false,
  },
  [WarpType.ClockTop]: {
    x: 790,
    y: -2005,
    key: [Phaser.Input.Keyboard.KeyCodes.DOWN],
    warpTo: WarpType.ClockStairs,
    visible: false,
  },

  [WarpType.ForestEast]: {
    x: 3600,
    y: 810,
    key: [Phaser.Input.Keyboard.KeyCodes.RIGHT, Phaser.Input.Keyboard.KeyCodes.D],
    warpTo: WarpType.Lake,
    visible: false,
  },
  [WarpType.Lake]: {
    x: 4625,
    y: 915,
    key: [Phaser.Input.Keyboard.KeyCodes.LEFT, Phaser.Input.Keyboard.KeyCodes.A],
    warpTo: WarpType.ForestEast,
    visible: false,
  },
};

export class Warp extends Physics.Arcade.Sprite implements Interactive {
  warpType: WarpType;
  player: Player;
  particles: GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene, warpType: WarpType, player: Player) {
    const { x, y, visible, warpTo } = WarpData[warpType];

    super(scene, x, y, visible ? 'ladder' : 'warp');
    this.warpType = warpType;
    this.player = player;
    this.scale = 0.5;
    // this.setVisible(visible);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    if (Config.debug) {
      this.setInteractive({ draggable: true });

      const target = WarpData[warpTo];

      const graphics = scene.add.graphics();
      const color = warpType % 2 === 0 ? 0xffff00 : 0x00ffff;
      graphics.fillStyle(color);
      graphics.lineStyle(3, color);

      let offsetX = -this.displayWidth / 2;
      let offsetY = -this.displayHeight / 2;

      if (target.x > x) offsetX *= -1;
      if (target.y > y) offsetY *= -1;

      const line = new Phaser.Geom.Line(x + offsetX, y + offsetY, target.x + offsetX, target.y + offsetY);
      graphics.strokeLineShape(line);
      graphics.fillRect(x + offsetX - 7, y + offsetY - 7, 14, 14);
    }

    if (!visible) {
      this.particles = scene.add
        .particles(x, y, 'warp', {
          x: { min: -3, max: 3 },
          y: { min: -3, max: 3 },
          speed: { random: [-40, 40] },
          scale: { min: 0.35, max: 0.5 },
          alpha: { start: 0.2, end: 0 },
          angle: { min: 0, max: 360 },
          color: [getColorNumber(Colors.Teal), getColorNumber(Colors.White), getColorNumber(Colors.Tan)],
          colorEase: 'Linear',
          radial: true,
          blendMode: BlendModes.OVERLAY,
        })
        .setScale(1, 1.75);

      this.particles = scene.add.particles(x, y, 'warp', {
        x: { min: -30, max: 30 },
        y: { min: -50, max: 50 },
        speed: { random: [-5, 5] },
        scale: { min: 0.05, max: 0.15 },
        alpha: { values: [0, 0.2, 0] },
        angle: { min: 0, max: 360 },
        lifespan: { min: 1000, max: 1400 },
        color: [getColorNumber(Colors.Peach), getColorNumber(Colors.White), getColorNumber(Colors.Tan)],
        colorEase: 'Linear',
        radial: true,
        maxAliveParticles: 20,
      });
    }

    if (warpType === WarpType.Underground) {
      scene.add.sprite(x, y - 60, 'ladder').setScale(0.5);
      scene.add.sprite(x, y - 105, 'ladder').setScale(0.5);
    }
  }

  onInteract(keys: { [key: string]: Phaser.Input.Keyboard.Key }) {
    let shouldWarp = false;
    const warpKeys = WarpData[this.warpType].key;
    Object.values(keys).forEach((key) => {
      if (key.isDown && warpKeys.includes(key.keyCode)) {
        shouldWarp = true;
      }
    });

    if (shouldWarp) {
      const { x, y } = WarpData[WarpData[this.warpType].warpTo];

      const targetScrollX = x - this.scene.cameras.main.width / 2;
      const targetScrollY = y - this.scene.cameras.main.height / 2;

      this.scene.cameras.main.stopFollow();
      this.player.setActive(false);
      this.scene.tweens.add({
        targets: this.scene.cameras.main,
        scrollX: targetScrollX,
        scrollY: targetScrollY - Config.cameraOffset,
        duration: 400,
        ease: 'Power1',
        onComplete: () => {
          this.scene.cameras.main.startFollow(this.player);
          this.scene.cameras.main.setFollowOffset(0, Config.cameraOffset);
          this.player.setActive(true);
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
        onComplete: () => {
          this.player.alpha = 1;
        },
      });

      return InteractResult.Teleported;
    }

    return InteractResult.None;
  }

  getButtonPrompt() {
    const buttons = WarpData[this.warpType].key.map((key) => {
      if (key === Phaser.Input.Keyboard.KeyCodes.ENTER || key === Phaser.Input.Keyboard.KeyCodes.SPACE)
        return '[CONTINUE]';
      if (key === Phaser.Input.Keyboard.KeyCodes.UP || key === Phaser.Input.Keyboard.KeyCodes.W) return '[UP]';
      if (key === Phaser.Input.Keyboard.KeyCodes.DOWN || key === Phaser.Input.Keyboard.KeyCodes.S) return '[DOWN]';
      if (key === Phaser.Input.Keyboard.KeyCodes.LEFT || key === Phaser.Input.Keyboard.KeyCodes.A) return '[LEFT]';
      if (key === Phaser.Input.Keyboard.KeyCodes.RIGHT || key === Phaser.Input.Keyboard.KeyCodes.D) return '[RIGHT]';

      return '[UNKNOWN]';
    });

    const unique = [...new Set(buttons)];

    return [`Travel to ${WarpType[WarpData[this.warpType].warpTo]}`, 'Press ' + unique.join(' or ')];
  }
}
