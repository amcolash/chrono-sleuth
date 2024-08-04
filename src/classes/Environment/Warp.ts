import { BlendModes, Cameras, GameObjects, Physics, Scene } from 'phaser';

import { Config } from '../../config';
import { JournalData } from '../../data/journal';
import { QuestData } from '../../data/quest';
import { InteractResult, Interactive, JournalEntry, LazyInitialize, WarpType } from '../../data/types';
import { WarpData, WarpVisual } from '../../data/warp';
import { Colors, getColorNumber } from '../../utils/colors';
import { hasJournalEntry } from '../../utils/interactionUtils';
import { shouldInitialize } from '../../utils/util';
import { Player } from '../Player/Player';
import { Key } from '../UI/InputManager';

const defaultRange = 30;
const warpYOffset = 12;

// Some warps need to be added on scene load. Since warpers are lazily created,
// any warps that might be enabled from save need to be added to scene.
const forcedInitializations: WarpType[] = [];
Object.values(QuestData).forEach((quest) => {
  if (quest.warpAdd) forcedInitializations.push(quest.warpAdd);
  if (quest.warpComplete) forcedInitializations.push(quest.warpComplete);
});
Object.values(JournalData).forEach((entry) => {
  if (entry.warpAdd) forcedInitializations.push(entry.warpAdd);
});

export class Warp extends Physics.Arcade.Image implements Interactive, LazyInitialize {
  warpType: WarpType;
  player: Player;

  particles1: GameObjects.Particles.ParticleEmitter;
  particles2: GameObjects.Particles.ParticleEmitter;
  graphics: GameObjects.Graphics;

  range: number;
  initialized: boolean = false;
  unlocked: boolean = true;

  constructor(scene: Scene, warpType: WarpType, player: Player) {
    const { x, y, visual, range, skipLighting } = WarpData[warpType];
    const texture = visual === WarpVisual.Ladder ? 'ladder' : 'warp';

    super(scene, x, y, texture);
    this.warpType = warpType;
    this.player = player;
    this.setScale(0.6);
    this.range = range || defaultRange;

    if (visual === WarpVisual.Warp || visual === WarpVisual.WarpHidden) {
      this.setScale(0.6, 1);
      this.setPosition(x, y - warpYOffset);
    }

    if (!skipLighting) {
      this.setPipeline('Light2D');
    }

    const hidden = visual === WarpVisual.WarpHidden || visual === WarpVisual.Invisible;
    if (hidden) this.unlocked = false;
    if (!Config.debug) this.setVisible(!hidden);

    if (warpType === WarpType.Underground) {
      scene.add
        .image(x, y - 60, 'ladder')
        .setScale(0.6)
        .setPipeline('Light2D');
      scene.add
        .image(x, y - 105, 'ladder')
        .setScale(0.6)
        .setPipeline('Light2D');
    }

    // Only add warps which need to be in the scene when loading a save
    if (forcedInitializations.includes(warpType)) scene.add.existing(this);
  }

  // Delay creating particles until the player is close enough to increase start up performance
  createParticles() {
    const { visual, skipLighting } = WarpData[this.warpType];
    if (visual === WarpVisual.Warp || visual === WarpVisual.WarpHidden) {
      this.particles1 = this.scene.add
        .particles(this.x, this.y - warpYOffset, 'warp', {
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
        .setScale(1, 2);
      this.particles1.viewBounds = this.particles1.getBounds(30, 500);

      this.particles2 = this.scene.add.particles(this.x, this.y - warpYOffset, 'warp', {
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
      this.particles2.viewBounds = this.particles2.getBounds(30, 500);

      if (!skipLighting) {
        this.particles1.setPipeline('Light2D');
        this.particles2.setPipeline('Light2D');
      }
    }
  }

  createDebug() {
    if (Config.debug) {
      this.setInteractive({ draggable: true });
      this.graphics = this.scene.add.graphics();

      // const target = WarpData[warpTo];

      // const color = warpType % 2 === 0 ? 0xffff00 : 0x00ffff;
      // graphics.fillStyle(color);
      // graphics.lineStyle(3, color);

      // let offsetX = -this.displayWidth / 2;
      // let offsetY = -this.displayHeight / 2;

      // if (target.x > x) offsetX *= -1;
      // if (target.y > y) offsetY *= -1;

      // const line = new Geom.Line(x + offsetX, y + offsetY, target.x + offsetX, target.y + offsetY);
      // graphics.strokeLineShape(line);
      // graphics.fillRect(x + offsetX - 7, y + offsetY - 7, 14, 14);
      // graphics.fillRect(x - this.body?.width / 2 - 7, y - this.body?.height / 2 - 7, 14, 14);

      // if (warpType === WarpType.Forest) console.log(this.body?.left, this.body.top);

      if (this.hasExtendedBounds()) {
        this.graphics.lineStyle(2, 0xff00ff).setPosition(this.x, this.y);

        const body = this.body as Physics.Arcade.Body;
        this.graphics.lineBetween(-this.range, -body.halfHeight, -this.range, body.halfHeight);
        this.graphics.lineBetween(this.range, -body.halfHeight, this.range, body.halfHeight);
        this.graphics.strokeCircle(0, 0, 5);
      }
    }
  }

  hasExtendedBounds() {
    const { visual, key } = WarpData[this.warpType];
    return (
      (visual === WarpVisual.Warp || visual === WarpVisual.WarpHidden || visual === WarpVisual.Invisible) &&
      (key === Key.Left || key === Key.Right)
    );
  }

  onInteract(keys: Record<Key, boolean>): InteractResult {
    const withinRange = !this.hasExtendedBounds() || Math.abs(this.player.x - this.x) < this.range;

    const warpKeys = WarpData[this.warpType].key;
    const shouldWarp = keys[warpKeys] && withinRange;

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

  setPosition(x?: number, y?: number, z?: number, w?: number): this {
    super.setPosition(x, y, z, w);

    if (this.particles1 && this.particles2) {
      this.particles1.setPosition(x, (y || 0) - warpYOffset);
      this.particles2.setPosition(x, (y || 0) - warpYOffset);
    }

    if (this.graphics) {
      this.graphics.setPosition(x, y);
    }

    return this;
  }

  setVisible(value: boolean): this {
    super.setVisible(value);

    // console.log('setting warp visibility', WarpType[this.warpType], value, this.unlocked);

    if (this.particles1 && this.particles2) {
      if (value && this.unlocked) {
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

  lazyInit(forceInit?: boolean) {
    if (!forceInit && (this.initialized || !shouldInitialize(this, this.player))) return;

    // Only add warps which were not previously added
    if (!forcedInitializations.includes(this.warpType)) this.scene.add.existing(this);

    this.scene.physics.add.existing(this);
    this.createParticles();
    this.createDebug();

    if (this.hasExtendedBounds() && this.body) {
      this.setBodySize(this.body.width * ((this.range / defaultRange) * 4), this.body.height);
    }

    // run overridden setVisible to make sure particls are properly started/stopped
    this.setVisible(this.visible);

    this.initialized = true;
  }

  update(_time: number, _delta: number) {
    this.lazyInit();
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
  const { x, y, onWarp } = WarpData[location];
  const scene = player.scene;

  const targetScrollX = x - scene.cameras.main.width / 2;
  const targetScrollY = y - scene.cameras.main.height / 2;

  if (onWarp) onWarp(player);

  scene.cameras.main.fadeOut(200, 0, 0, 0, (_camera: Cameras.Scene2D.Camera, progress: number) => {
    if (progress >= 1) scene.cameras.main.fadeIn(1000, 0, 0, 0);
  });

  scene.cameras.main.stopFollow();
  scene.tweens.add({
    targets: scene.cameras.main,
    scrollX: targetScrollX,
    scrollY: targetScrollY - Config.cameraOffset,
    duration: 600,
    delay: 100,
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
    duration: 500,
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
    duration: 400,
    ease: 'Power1',
  });
}
