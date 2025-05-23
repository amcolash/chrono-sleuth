import { GameObjects, Math as PhaserMath, Physics, Scene, Types } from 'phaser';

import { Config } from '../../config';
import { JournalData } from '../../data/journal';
import { Layer } from '../../data/layers';
import { QuestData } from '../../data/quest';
import { InteractResult, Interactive, LazyInitialize, WarpType } from '../../data/types';
import { WarpData, WarpVisual } from '../../data/warp';
import { Game } from '../../scenes/Game';
import { initializeObject } from '../../utils/interactionUtils';
import { isNighttime } from '../../utils/lighting';
import {
  fadeIn,
  fadeOut,
  lockCamera,
  nearby,
  openDialog,
  shouldInitialize,
  splitTitleCase,
  unlockCamera,
} from '../../utils/util';
import { Music } from '../Music';
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
  locked: boolean;

  graphics: GameObjects.Graphics;
  light: GameObjects.PointLight;

  portal1: GameObjects.Sprite;
  portal2: GameObjects.Sprite;

  range: number;
  initialized: boolean = false;

  constructor(scene: Scene, warpType: WarpType, player: Player) {
    const { x, y, visual, range } = WarpData[warpType];

    super(scene, x, y, 'props', 'warp');
    this.name = `Warp-${warpType}`;
    this.warpType = warpType;
    this.player = player;
    this.range = range || defaultRange;

    this.setScale(0.6).setDepth(Layer.Warpers);

    if (visual === WarpVisual.Warp || visual === WarpVisual.WarpLocked) {
      this.setScale(0.6, 1);
      this.setPosition(x, y - warpYOffset);
    }

    if (!Config.debug) {
      this.updateLocked(visual === WarpVisual.WarpLocked || visual === WarpVisual.InvisibleLocked);
      if (visual === WarpVisual.Invisible || visual === WarpVisual.InvisibleLocked) this.setAlpha(0);
    }

    initializeObject(this, WarpData[warpType]);

    // Only add warps which need to be in the scene when loading a save
    if (forcedInitializations.includes(warpType)) scene.add.existing(this);
  }

  lazyInit() {
    if (this.initialized || !shouldInitialize(this, this.player)) return;

    // Only add warps which were not previously added
    if (!forcedInitializations.includes(this.warpType)) this.scene.add.existing(this);

    this.scene.physics.add.existing(this);
    this.createAnimations();
    this.createDebug();

    const { onCreate, visual } = WarpData[this.warpType];

    if (visual === WarpVisual.Warp || visual === WarpVisual.WarpLocked) {
      this.light = this.scene.lights.addPointLight(this.x, this.y, 0x4e4faf, 125, 0);
    }

    if (this.hasExtendedBounds() && this.body) {
      this.setBodySize(this.body.width * ((this.range / defaultRange) * 4), this.body.height);
    }

    // re-run updateLocked to make sure animations are properly started/stopped
    this.updateLocked();

    if (onCreate) onCreate(this);
    this.initialized = true;
  }

  // Delay creating animations until the player is close enough to increase start up performance
  createAnimations() {
    const { visual, skipLighting } = WarpData[this.warpType];
    if (visual === WarpVisual.Warp || visual === WarpVisual.WarpLocked) {
      this.setAlpha(0.1);

      if (!this.scene.anims.exists('portal')) {
        this.scene.anims.create({
          key: 'portal',
          frames: this.scene.anims.generateFrameNumbers('portal', { start: 0, end: 63 }),
          frameRate: 10,
          repeat: -1,
          randomFrame: true,
        });
      }

      this.portal1 = this.scene.add
        .sprite(this.x, this.y, 'portal_0')
        .setScale(0.45, 1)
        .setAlpha(0.9)
        .setName(`${this.name}-1`)
        .play('portal');
      this.portal1.postFX.addPixelate(1);
      this.portal1.postFX.addShadow(0, 0, 0.1, 2, 0x3333aa, 3, 0.5);

      this.portal2 = this.scene.add
        .sprite(this.x, this.y, 'portal_0')
        .setScale(0.35, 1)
        .setAlpha(0.65)
        .setFlipX(true)
        .setName(`${this.name}-2`)
        .play('portal');
      this.portal2.postFX.addPixelate(1);
      this.portal2.setFrame(Math.floor(Math.random() * 30));

      if (!skipLighting) {
        this.portal1.setPipeline('Light2D');
        this.portal2.setPipeline('Light2D');
      }

      this.portal1.setPostPipeline('XRayPipeline');
      this.portal2.setPostPipeline('XRayPipeline');
    }
  }

  createDebug() {
    if (Config.debug) {
      this.setInteractive({ draggable: true });
      this.graphics = this.scene.add.graphics();

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
      (visual === WarpVisual.Warp || visual === WarpVisual.WarpLocked || visual === WarpVisual.Invisible) &&
      (key === Key.Left || key === Key.Right)
    );
  }

  onInteract(keys: Record<Key, boolean>): InteractResult {
    const withinRange = !this.hasExtendedBounds() || Math.abs(this.player.x - this.x) < this.range;

    const warpKeys = WarpData[this.warpType].key;
    const shouldWarp = keys[warpKeys] && withinRange;

    if (shouldWarp && this.warpType === WarpType.TownEast && !this.player.gameState.data.mazeSolved && !Config.debug) {
      openDialog(this.scene as Game, 'MazeDialog');
      return InteractResult.None;
    }

    if (shouldWarp) {
      const data = WarpData[this.warpType];
      warpTo(this.warpType, data.warpTo, this.player, { x: 0, y: -warpYOffset });
      return InteractResult.Teleported;
    }

    return InteractResult.None;
  }

  getButtonPrompt() {
    const { key, location, name } = WarpData[this.warpType];

    let prompt;
    if (key === Key.Up) prompt = '[Up]';
    if (key === Key.Down) prompt = '[Down]';
    if (key === Key.Left) prompt = '[Left]';
    if (key === Key.Right) prompt = '[Right]';

    let destination: string = name || location;
    destination = splitTitleCase(destination);

    const debug = Config.debug ? `(WarpType.${WarpType[this.warpType]})` : undefined;

    return [debug, `Travel to ${destination}`, 'Press ' + prompt].filter((s) => s) as string[];
  }

  setPosition(x?: number, y?: number, z?: number, w?: number): this {
    super.setPosition(x, y, z, w);

    this.portal1?.setPosition(x, y);
    this.portal2?.setPosition(x, y);
    this.graphics?.setPosition(x, y);

    return this;
  }

  setVisible(value: boolean): this {
    super.setVisible(value);

    this.portal1?.setVisible(value);
    this.portal2?.setVisible(value);
    this.light?.setVisible(value);

    return this;
  }

  updateLocked(locked?: boolean) {
    if (locked !== undefined) this.locked = locked;
    this.setVisible(!this.locked);
  }

  update(_time: number, _delta: number) {
    this.lazyInit();
    if (!this.initialized) return;

    if (this.light && nearby(this, this.player, Config.width / 1.8)) {
      this.light.setPosition(this.x, this.y);
      this.light.intensity = PhaserMath.Clamp(this.light.intensity + Math.random() * 0.025 - 0.0125, 0.1, 0.2);
    }
  }

  destroy(fromScene?: boolean): void {
    this.portal1?.destroy(fromScene);
    this.portal2?.destroy(fromScene);

    super.destroy(fromScene);
  }
}

const directions = {
  [Key.Up]: { x: 0, y: -1 },
  [Key.Down]: { x: 0, y: 1 },
  [Key.Left]: { x: -1, y: 0 },
  [Key.Right]: { x: 1, y: 0 },
};

export function warpTo(
  source: WarpType,
  destination: WarpType,
  player: Player,
  offset?: Types.Math.Vector2Like,
  force?: boolean
) {
  const { direction, key, sound, visual, location, onWarpStart } = WarpData[source];
  let { x, y } = WarpData[destination];

  let canWarp = true;
  if (
    isNighttime(player.scene) &&
    (source === WarpType.LibraryEntrance || source === WarpType.ClockSquareNorth || source === WarpType.Inn)
  )
    canWarp = false;
  if ((!Config.prod && force) || Config.debug) canWarp = true;

  if (!canWarp) {
    player.message.setDialog(
      { messages: ['It is too late to venture off now.', 'I should rest at the inn until tomorrow.'] },
      player
    );
    return;
  }

  const movement = directions[direction !== undefined ? direction : key];
  const scene = player.scene;
  const camera = scene.cameras.main;

  // Calculate offset warp position
  if (offset) {
    x += offset.x;
    y += offset.y;
  }

  // Calculate final camera position
  const targetScrollX = x - scene.cameras.main.width / 2;
  const targetScrollY = y - scene.cameras.main.height / 2 - Config.cameraOffset;

  // Determine warp sound
  let warpSound = 'warp';
  if (visual === WarpVisual.Invisible || visual === WarpVisual.InvisibleLocked) warpSound = 'door';
  if (sound) warpSound = sound;

  unlockCamera(player);
  const music = Music.getLocationMusic(location);
  if (music) Music.start(music);

  onWarpStart?.(player);

  scene.add
    .timeline([
      // Fade out camera and move in direction of warp
      {
        at: 0,
        run: () => {
          fadeOut(scene, 200);
          scene.sound.playAudioSprite('sfx', warpSound);
        },
        tween: {
          delay: 0,
          targets: camera,
          scrollX: camera.scrollX + movement.x * 75,
          scrollY: camera.scrollY + movement.y * 75,
          duration: 200,
        },
      },
      // Fade out player
      {
        at: 0,
        tween: {
          targets: player,
          alpha: 0,
          duration: 200,
        },
      },
      // Move player / camera to final position
      {
        at: 450,
        run: () => {
          player.unlockCamera = false;
          player.setPosition(x, y);
          player.previousPosition.set(x, y);
          camera.scrollX = targetScrollX;
          camera.scrollY = targetScrollY;
        },
      },
      // Fade in player/camera, then re-enable player
      {
        at: 600,
        tween: {
          targets: player,
          alpha: 1,
          duration: 200,
        },
        run: () =>
          fadeIn(scene, 400, () => {
            lockCamera(player);
          }),
      },
    ])
    .play();
}
