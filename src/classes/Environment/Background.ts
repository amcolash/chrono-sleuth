import { Math as PhaserMath, Physics, Scene } from 'phaser';

import { Config } from '../../config';
import { Data as BackgroundInfo } from '../../data/background';
import { Layer } from '../../data/layers';
import { LazyInitialize } from '../../data/types';
import { initializeObject } from '../../utils/interactionUtils';
import { shouldInitialize } from '../../utils/util';
import { Player } from '../Player/Player';

export class Background extends Physics.Arcade.Image implements LazyInitialize {
  player: Player;
  initialized: boolean = false;
  info: BackgroundInfo;
  center: PhaserMath.Vector2;

  constructor(scene: Scene, info: BackgroundInfo, player: Player) {
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
      scene.add
        .rectangle(this.center.x, this.center.y, img.width, img.height)
        .setStrokeStyle(10, 0x006666)
        .setOrigin(0.5);
    }
  }

  lazyInit(forceInit?: boolean) {
    if (!forceInit && (this.initialized || !shouldInitialize(this.center, this.player, 2000))) return;

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    if (Config.debug) {
      this.setInteractive({ draggable: true });
    }

    this.initialized = true;
  }

  update() {
    this.lazyInit();
  }
}
