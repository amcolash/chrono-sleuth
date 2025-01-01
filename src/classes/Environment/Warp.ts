import { Cameras, GameObjects, Physics, Scene, Types } from 'phaser';

import { Config } from '../../config';
import { JournalData } from '../../data/journal';
import { Layer } from '../../data/layers';
import { QuestData } from '../../data/quest';
import { InteractResult, Interactive, LazyInitialize, WarpType } from '../../data/types';
import { WarpData, WarpVisual } from '../../data/warp';
import { Game } from '../../scenes/Game';
import { initializeObject } from '../../utils/interactionUtils';
import { openDialog, shouldInitialize, splitTitleCase } from '../../utils/util';
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

  portal1: GameObjects.Sprite;
  portal2: GameObjects.Sprite;

  range: number;
  initialized: boolean = false;

  constructor(scene: Scene, warpType: WarpType, player: Player) {
    const { x, y, visual, range } = WarpData[warpType];
    const texture = visual === WarpVisual.Ladder ? 'ladder' : 'warp';

    super(scene, x, y, texture);
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
      this.setLocked(visual === WarpVisual.WarpLocked || visual === WarpVisual.InvisibleLocked);
      if (visual === WarpVisual.Invisible || visual === WarpVisual.InvisibleLocked) this.setAlpha(0);
    }

    initializeObject(this, WarpData[warpType]);

    // Only add warps which need to be in the scene when loading a save
    if (forcedInitializations.includes(warpType)) scene.add.existing(this);
  }

  lazyInit(forceInit?: boolean) {
    if (!forceInit && (this.initialized || !shouldInitialize(this, this.player))) return;

    // Only add warps which were not previously added
    if (!forcedInitializations.includes(this.warpType)) this.scene.add.existing(this);

    this.scene.physics.add.existing(this);
    this.createParticles();
    this.createDebug();

    if (this.warpType === WarpType.Underground) this.createLadder();

    if (this.hasExtendedBounds() && this.body) {
      this.setBodySize(this.body.width * ((this.range / defaultRange) * 4), this.body.height);
    }

    // re-run setLocked to make sure particles are properly started/stopped
    this.setLocked(this.locked);

    this.initialized = true;
  }

  // Delay creating particles until the player is close enough to increase start up performance
  createParticles() {
    const { visual, skipLighting } = WarpData[this.warpType];
    if (visual === WarpVisual.Warp || visual === WarpVisual.WarpLocked) {
      this.setAlpha(0.1);

      if (!this.scene.anims.exists('portal')) {
        this.scene.anims.create({
          key: 'portal',
          frames: this.scene.anims.generateFrameNumbers('portal', { start: 0, end: 63 }),
          frameRate: 10,
          repeat: -1,
        });
      }

      this.portal1 = this.scene.add
        .sprite(this.x, this.y, 'portal_0')
        .setScale(0.45, 1)
        .setAlpha(0.9)
        .play('portal')
        .setName(`${this.name}-1`);
      this.portal1.postFX.addPixelate(1);
      this.portal1.postFX.addShadow(0, 0, 0.1, 1, 0x3333aa, 6, 0.5);

      this.portal2 = this.scene.add
        .sprite(this.x, this.y, 'portal_0')
        .setScale(0.35, 1)
        .setAlpha(0.65)
        .setFlipX(true)
        .setName(`${this.name}-2`);
      this.portal2.postFX.addPixelate(1);
      this.portal2.play('portal');
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

  createLadder() {
    this.scene.add
      .image(this.x, this.y - 60, 'ladder')
      .setScale(0.6)
      .setDepth(Layer.Warpers)
      .setPipeline('Light2D')
      .setPostPipeline('XRayPipeline')
      .setName('Ladder1');
    this.scene.add
      .image(this.x, this.y - 105, 'ladder')
      .setScale(0.6)
      .setDepth(Layer.Warpers)
      .setPipeline('Light2D')
      .setPostPipeline('XRayPipeline')
      .setName('Ladder2');
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
      warpTo(WarpData[this.warpType].warpTo, this.player, undefined, this);
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

    let location = WarpType[WarpData[this.warpType].warpTo];
    location = splitTitleCase(location);

    return [`Travel to ${location}`, 'Press ' + prompt];
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

    return this;
  }

  setLocked(locked: boolean) {
    this.locked = locked;
    this.setVisible(!locked);
  }

  update(_time: number, _delta: number) {
    this.lazyInit();
  }

  destroy(fromScene?: boolean): void {
    this.portal1?.destroy(fromScene);
    this.portal2?.destroy(fromScene);

    super.destroy(fromScene);
  }
}

export function warpTo(location: WarpType, player: Player, offset?: Types.Math.Vector2Like, sourceWarp?: Warp) {
  let { x, y, onWarp } = WarpData[location];
  if (offset) {
    x += offset.x;
    y += offset.y;
  }

  const scene = player.scene;

  const targetScrollX = x - scene.cameras.main.width / 2;
  const targetScrollY = y - scene.cameras.main.height / 2;

  if (onWarp) onWarp(player);

  let sound = 'warp';

  if (sourceWarp) {
    const data = WarpData[sourceWarp.warpType];
    if (data.visual === WarpVisual.Ladder) sound = 'ladder';
    if (data.visual === WarpVisual.Invisible || data.visual === WarpVisual.InvisibleLocked) sound = 'door';

    if (data.sound) sound = data.sound;
  }

  scene.sound.play(sound);

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
      scene.cameras.main.startFollow(player, true);
      scene.cameras.main.setFollowOffset(0, Config.cameraOffset);
    },
  });

  // fade player out and then in again
  player.setActive(false);
  player.buttonPrompt.setVisible(false);
  scene.tweens.add({
    targets: player,
    alpha: 0,
    duration: 500,
    ease: 'Power1',
    yoyo: true,
    repeat: 0,
    onYoyo: () => {
      player.setPosition(x, y);
      player.previousPosition.set(x, y);
    },
    onComplete: () => {
      player.alpha = 1;
      player.setActive(true);
    },
  });

  scene.tweens.add({
    targets: player.light,
    intensity: 0,
    duration: 50,
    hold: 600,
    yoyo: true,
    repeat: 0,
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
