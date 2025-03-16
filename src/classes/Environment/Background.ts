import { GameObjects, Geom, Math as PhaserMath, Physics } from 'phaser';

import { Config } from '../../config';
import { Data as BackgroundInfo } from '../../data/background';
import { Layer } from '../../data/layers';
import { MusicData } from '../../data/music';
import { LazyInitialize, MusicType } from '../../data/types';
import { Game } from '../../scenes/Game';
import { initializeObject } from '../../utils/interactionUtils';
import { shouldInitialize } from '../../utils/util';
import { Music } from '../Music';
import { Player } from '../Player/Player';

export class Background extends Physics.Arcade.Image implements LazyInitialize {
  player: Player;
  initialized: boolean = false;
  info: BackgroundInfo;
  center: PhaserMath.Vector2;
  bounds: Geom.Rectangle = new Geom.Rectangle();
  debug: GameObjects.Rectangle;
  music: MusicType | undefined;

  constructor(scene: Game, info: BackgroundInfo, player: Player) {
    const { x, y, image, scale } = info;
    super(scene, x, y, image);
    this.name = `Background-${info.image}`;

    this.info = info;
    this.player = player;

    this.setOrigin(0).setDepth(Layer.Backgrounds);
    initializeObject(this, info);

    const img = scene.textures.get(image)?.getSourceImage();
    this.center = new PhaserMath.Vector2(x + (img.width * (scale || 1)) / 2, y + img.height * ((scale || 1) / 2));

    const found = Object.entries(MusicData).find(([key, value]) => value.locations.includes(this.info.location));
    this.music = found ? (found[0] as MusicType) : undefined;

    if (Config.debug) {
      this.debug = scene.add
        .rectangle(this.x, this.y, img.width * (scale || 1), img.height * (scale || 1))
        .setStrokeStyle(6, 0x006666)
        .setOrigin(0)
        .setDepth(Layer.Debug);
    }
  }

  lazyInit() {
    if (this.initialized || !shouldInitialize(this.center, this.player, 2000)) return;

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    this.getBounds(this.bounds);

    if (Config.debug) {
      this.setInteractive({ draggable: true });
    }

    if (this.info.onCreate) this.info.onCreate(this);
    this.initialized = true;
  }

  update() {
    this.lazyInit();

    if (this.bounds?.contains(this.player.x, this.player.y)) {
      if (this.player.active && this.music) Music.start(this.music);

      // Keep camera within bounds, only skip when warping
      if (!Config.debug && !this.player.unlockCamera) {
        if (this.bounds.width < Config.width) {
          // Fix portrait maps, center in frame
          const difference = Config.width - this.bounds.width;
          this.scene.cameras.main.setBounds(
            this.bounds.x - difference / 2,
            this.bounds.y,
            Config.width,
            this.bounds.height
          );
        } else if (this.bounds.height < Config.height) {
          // Fix landscape maps, center in frame
          const difference = Config.height - this.bounds.height;
          this.scene.cameras.main.setBounds(
            this.bounds.x,
            this.bounds.y - difference / 2,
            this.bounds.width,
            Config.height
          );
        } else {
          this.scene.cameras.main.setBounds(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
        }
      }
    }

    if (Config.debug) {
      this.debug?.setPosition(this.x, this.y);
    }
  }
}
