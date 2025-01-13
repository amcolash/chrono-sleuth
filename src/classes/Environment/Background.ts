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
  bounds: Geom.Rectangle;
  debug: GameObjects.Rectangle;

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

    if (Config.debug) {
      this.debug = scene.add.rectangle(this.x, this.y, img.width, img.height).setStrokeStyle(10, 0x006666).setOrigin(0);
    }
  }

  lazyInit(forceInit?: boolean) {
    if (!forceInit && (this.initialized || !shouldInitialize(this.center, this.player, 2000))) return;

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    this.bounds = this.getBounds();

    if (Config.debug) {
      this.setInteractive({ draggable: true });
    }

    this.initialized = true;
  }

  update() {
    this.lazyInit();

    if (this.bounds?.contains(this.player.x, this.player.y)) {
      const music = Object.entries(MusicData).find(([key, value]) => value.locations.includes(this.info.location));
      if (music && Music.music?.key !== music[0]) Music.start(music[0] as MusicType);
    }

    this.debug?.setPosition(this.x, this.y);
  }
}
