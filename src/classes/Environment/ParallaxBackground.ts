import { GameObjects, Geom, Math as PhaserMath, Types } from 'phaser';

import { Config } from '../../config';
import { Layer } from '../../data/layers';
import { Data as ParallaxData } from '../../data/parallaxBackground';
import { LazyInitialize } from '../../data/types';
import { Game } from '../../scenes/Game';
import { shouldInitialize } from '../../utils/util';
import { Player } from '../Player/Player';

export class ParallaxBackground extends GameObjects.Container implements LazyInitialize {
  initialized = false;
  center: PhaserMath.Vector2;
  player: Player;
  layers: GameObjects.TileSprite[] = [];

  info: ParallaxData;

  constructor(scene: Game, info: ParallaxData) {
    const { position, size } = info;
    super(scene, position.x, position.y);
    this.name = `ParallaxBackground-${position.x}-${position.y}`;

    this.info = info;
    this.player = scene.player;

    this.setDepth(Layer.Backgrounds);

    this.center = new PhaserMath.Vector2(position.x + 0.5 * size.x, position.y + 0.5 * size.y);

    if (Config.debug) {
      this.add(
        scene.add.rectangle(this.center.x, this.center.y, size.x, size.y).setStrokeStyle(10, 0x006666).setOrigin(0.5)
      );
    }
  }

  lazyInit() {
    if (this.initialized || !shouldInitialize(this.center, this.player, this.info.size.x)) return;

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    const { position, size, scale, images, skipLighting } = this.info;
    images.forEach(({ texture, scale: imgScale, speed }) => {
      const img = this.scene.add.tileSprite(position.x, position.y, size.x, size.y, texture);
      img
        .setOrigin(0)
        .setTileScale((scale || 1) * (imgScale || 1))
        .setData('speed', speed);

      if (!skipLighting) img.setPipeline('Light2D');
      img.setPostPipeline('XRayPipeline');

      this.add(img);
      this.layers.push(img);
    });

    if (Config.debug) {
      this.setInteractive({
        draggable: true,
        hitArea: new Geom.Rectangle(position.x, position.y, size.x, size.y),
        hitAreaCallback: Geom.Rectangle.Contains,
      } as Types.Input.InputConfiguration);
    }

    this.initialized = true;
  }

  update() {
    this.lazyInit();

    if (!this.initialized || !this.getBounds().contains(this.player.x, this.player.y)) return;

    const { size } = this.info;
    const distance = PhaserMath.Clamp(this.player.x - this.center.x, -0.5 * size.x, 0.5 * size.x) / size.x;

    this.layers.forEach((img) => {
      img.tilePositionX = distance * img.getData('speed') * size.x;
    });
  }
}
