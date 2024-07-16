import { BlendModes, GameObjects, Physics } from 'phaser';

import { Config } from '../config';
import { Colors, getColorNumber } from '../utils/colors';
import { hasJournalEntry } from '../utils/interactionUtils';
import { Player } from './Player';
import { InteractResult, Interactive, JournalEntry, WarpType } from './types';

enum WarpVisual {
  Ladder,
  Warp,
  WarpHidden,
}

const DOWN = [Phaser.Input.Keyboard.KeyCodes.DOWN, Phaser.Input.Keyboard.KeyCodes.S];
const UP = [Phaser.Input.Keyboard.KeyCodes.UP, Phaser.Input.Keyboard.KeyCodes.W];
const LEFT = [Phaser.Input.Keyboard.KeyCodes.LEFT, Phaser.Input.Keyboard.KeyCodes.A];
const RIGHT = [Phaser.Input.Keyboard.KeyCodes.RIGHT, Phaser.Input.Keyboard.KeyCodes.D];

export const WarpData = {
  [WarpType.Town]: {
    x: 300,
    y: 650,
    key: DOWN,
    warpTo: WarpType.Underground,
    visual: WarpVisual.Ladder,
  },
  [WarpType.Underground]: {
    x: 301,
    y: 875,
    key: UP,
    warpTo: WarpType.Town,
    visual: WarpVisual.Ladder,
  },

  [WarpType.TownEast]: {
    x: 1720,
    y: 650,
    key: RIGHT,
    warpTo: WarpType.Forest,
    visual: WarpVisual.WarpHidden,
  },
  [WarpType.Forest]: {
    x: 2650,
    y: 810,
    key: LEFT,
    warpTo: WarpType.TownEast,
    visual: WarpVisual.Warp,
  },

  [WarpType.TownNorth]: {
    x: 775,
    y: 650,
    key: UP,
    warpTo: WarpType.ClockSquare,
    visual: WarpVisual.WarpHidden,
  },
  [WarpType.ClockSquare]: {
    x: 720,
    y: -330,
    key: DOWN,
    warpTo: WarpType.TownNorth,
    visual: WarpVisual.Warp,
  },

  [WarpType.ClockSquareNorth]: {
    x: 915,
    y: -330,
    key: UP,
    warpTo: WarpType.ClockEntrance,
    visual: WarpVisual.WarpHidden,
  },
  [WarpType.ClockEntrance]: {
    x: 900,
    y: -1320,
    key: DOWN,
    warpTo: WarpType.ClockSquareNorth,
    visual: WarpVisual.Warp,
  },

  [WarpType.ClockStairs]: {
    x: 735,
    y: -1320,
    key: UP,
    warpTo: WarpType.ClockTop,
    visual: WarpVisual.Warp,
  },
  [WarpType.ClockTop]: {
    x: 790,
    y: -2005,
    key: DOWN,
    warpTo: WarpType.ClockStairs,
    visual: WarpVisual.Warp,
  },

  [WarpType.ForestEast]: {
    x: 3590,
    y: 810,
    key: RIGHT,
    warpTo: WarpType.Lake,
    visual: WarpVisual.WarpHidden,
  },
  [WarpType.Lake]: {
    x: 4625,
    y: 915,
    key: LEFT,
    warpTo: WarpType.ForestEast,
    visual: WarpVisual.Warp,
  },
};

export class Warp extends Physics.Arcade.Sprite implements Interactive {
  warpType: WarpType;
  player: Player;
  particles1: GameObjects.Particles.ParticleEmitter;
  particles2: GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene, warpType: WarpType, player: Player) {
    const { x, y, visual, warpTo } = WarpData[warpType];

    super(scene, x, y, visual === WarpVisual.Ladder ? 'ladder' : 'warp');
    this.warpType = warpType;
    this.player = player;
    this.scale = 0.5;

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

    if (visual !== WarpVisual.Ladder) {
      this.particles1 = scene.add
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

      this.particles2 = scene.add.particles(x, y, 'warp', {
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

    this.setVisible(visual !== WarpVisual.WarpHidden);
  }

  onInteract(keys: { [key: string]: Phaser.Input.Keyboard.Key }) {
    let shouldWarp = false;
    const warpKeys = WarpData[this.warpType].key;
    Object.values(keys).forEach((key) => {
      if (key.isDown && warpKeys.includes(key.keyCode)) {
        shouldWarp = true;
      }
    });

    if (
      shouldWarp &&
      this.warpType === WarpType.TownEast &&
      !hasJournalEntry(this.player.journal.journal, JournalEntry.ForestMazeSolved) &&
      !Config.debug
    ) {
      this.scene.scene.pause();
      this.scene.scene.launch('MazeDialog', { player: this.player });
      return InteractResult.None;
    }

    if (shouldWarp) {
      warpTo(WarpData[this.warpType].warpTo, this.player);
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

  setVisible(value: boolean): this {
    super.setVisible(value);

    if (this.particles1 && this.particles2) {
      if (value) {
        this.particles1.start();
        this.particles2.start();
      } else {
        this.particles1.stop();
        this.particles1.killAll();

        this.particles2.stop();
        this.particles2.killAll();
      }
    }

    return this;
  }

  destroy(fromScene?: boolean): void {
    if (this.particles1 && this.particles2) {
      this.particles1.destroy();
      this.particles2.destroy();
    }

    super.destroy(fromScene);
  }
}

export function warpTo(location: WarpType, player: Player) {
  const { x, y } = WarpData[location];
  const scene = player.scene;

  const targetScrollX = x - scene.cameras.main.width / 2;
  const targetScrollY = y - scene.cameras.main.height / 2;

  scene.cameras.main.stopFollow();
  player.setActive(false);
  scene.tweens.add({
    targets: scene.cameras.main,
    scrollX: targetScrollX,
    scrollY: targetScrollY - Config.cameraOffset,
    duration: 400,
    ease: 'Power1',
    onComplete: () => {
      scene.cameras.main.startFollow(player);
      scene.cameras.main.setFollowOffset(0, Config.cameraOffset);
      player.setActive(true);
    },
  });

  // fade player out and then in again
  scene.tweens.add({
    targets: player,
    alpha: 0,
    duration: 300,
    ease: 'Power1',
    yoyo: true,
    repeat: 0,
    onYoyo: () => {
      player.setPosition(x, y);
    },
    onComplete: () => {
      player.alpha = 1;
    },
  });
}
