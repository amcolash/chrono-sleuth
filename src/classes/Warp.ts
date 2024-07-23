import { BlendModes, GameObjects, Physics } from 'phaser';

import { Config } from '../config';
import { Colors, getColorNumber } from '../utils/colors';
import { hasJournalEntry } from '../utils/interactionUtils';
import { Key } from './InputManager';
import { Player } from './Player';
import { InteractResult, Interactive, JournalEntry, WarpType } from './types';

enum WarpVisual {
  Ladder,
  Warp,
  WarpHidden, // Default to invisible
  Invisible, // Not visually shown, but still functioning
}

export const WarpData = {
  [WarpType.Town]: {
    x: 300,
    y: 650,
    key: Key.Down,
    warpTo: WarpType.Underground,
    visual: WarpVisual.Ladder,
  },
  [WarpType.Underground]: {
    x: 301,
    y: 875,
    key: Key.Up,
    warpTo: WarpType.Town,
    visual: WarpVisual.Ladder,
  },

  [WarpType.TownEast]: {
    x: 1720,
    y: 650,
    key: Key.Right,
    warpTo: WarpType.Forest,
    visual: WarpVisual.WarpHidden,
  },
  [WarpType.Forest]: {
    x: 2650,
    y: 815,
    key: Key.Left,
    warpTo: WarpType.TownEast,
    visual: WarpVisual.Warp,
  },

  [WarpType.TownNorth]: {
    x: 775,
    y: 650,
    key: Key.Up,
    warpTo: WarpType.ClockSquare,
    visual: WarpVisual.WarpHidden,
  },
  [WarpType.ClockSquare]: {
    x: 610,
    y: -330,
    key: Key.Left,
    warpTo: WarpType.TownNorth,
    visual: WarpVisual.Warp,
  },

  [WarpType.ClockSquareNorth]: {
    x: 915,
    y: -330,
    key: Key.Up,
    warpTo: WarpType.ClockEntrance,
    visual: WarpVisual.WarpHidden,
  },
  [WarpType.ClockEntrance]: {
    x: 690,
    y: -1320,
    key: Key.Left,
    warpTo: WarpType.ClockSquareNorth,
    visual: WarpVisual.Warp,
  },

  [WarpType.ClockStairs]: {
    x: 890,
    y: -1400,
    key: Key.Right,
    warpTo: WarpType.ClockTop,
    visual: WarpVisual.Invisible,
  },
  [WarpType.ClockTop]: {
    x: 780,
    y: -1970,
    key: Key.Left,
    warpTo: WarpType.ClockStairs,
    visual: WarpVisual.Invisible,
  },

  [WarpType.ForestEast]: {
    x: 3590,
    y: 815,
    key: Key.Right,
    warpTo: WarpType.Lake,
    visual: WarpVisual.WarpHidden,
  },
  [WarpType.Lake]: {
    x: 4625,
    y: 915,
    key: Key.Left,
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
    const texture = visual === WarpVisual.Ladder ? 'ladder' : 'warp';

    super(scene, x, y, texture);
    this.warpType = warpType;
    this.player = player;
    this.setScale(0.6).setPipeline('Light2D');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    if (visual === WarpVisual.Warp || visual === WarpVisual.WarpHidden) {
      this.setScale(0.6, 1);

      const warpOffset = 12;
      this.setPosition(x, y - warpOffset);

      this.particles1 = scene.add
        .particles(x, y - warpOffset, 'warp', {
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
        .setScale(1, 2)
        .setPipeline('Light2D');

      this.particles2 = scene.add
        .particles(x, y - warpOffset, 'warp', {
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
        })
        .setPipeline('Light2D');
    }

    if (warpType === WarpType.Underground) {
      scene.add
        .sprite(x, y - 60, 'ladder')
        .setScale(0.6)
        .setPipeline('Light2D');
      scene.add
        .sprite(x, y - 105, 'ladder')
        .setScale(0.6)
        .setPipeline('Light2D');
    }

    if (visual === WarpVisual.Invisible) this.setAlpha(0);
    this.setVisible(visual !== WarpVisual.WarpHidden);

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
  }

  onInteract(keys: Record<Key, boolean>): InteractResult {
    const warpKeys = WarpData[this.warpType].key;
    const shouldWarp = keys[warpKeys];

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
    const key = WarpData[this.warpType].key;

    let prompt;
    if (key === Key.Continue) prompt = '[CONTINUE]';
    if (key === Key.Up) prompt = '[Up]';
    if (key === Key.Down) prompt = '[Down]';
    if (key === Key.Left) prompt = '[Left]';
    if (key === Key.Right) prompt = '[Right]';

    return [`Travel to ${WarpType[WarpData[this.warpType].warpTo]}`, 'Press ' + prompt];
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
  scene.tweens.add({
    targets: scene.cameras.main,
    scrollX: targetScrollX,
    scrollY: targetScrollY - Config.cameraOffset,
    duration: 400,
    ease: 'Power1',
    onComplete: () => {
      scene.cameras.main.startFollow(player);
      scene.cameras.main.setFollowOffset(0, Config.cameraOffset);
    },
  });

  // fade player out and then in again
  player.setActive(false);
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
      player.setActive(true);
    },
  });

  // move player to new location
  const light = player.light instanceof GameObjects.Light ? player.light : player.light.light;
  scene.tweens.add({
    targets: light,
    x,
    y,
    duration: 300,
    ease: 'Power1',
  });
}
