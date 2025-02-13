import { GameObjects, Geom } from 'phaser';

import { Player } from '../../classes/Player/Player';
import { Config } from '../../config';
import { Dialog } from './Dialog';

export class Books extends Dialog {
  player: Player;
  books: GameObjects.Image[] = [];

  constructor() {
    super({ key: 'Books', title: 'Books', gamepadVisible: false, hideCloseSuccess: true, skipUI: true });
  }

  preload() {
    this.load.setPath('assets');

    this.load.atlas('bookshelf', 'atlases/bookshelf.png', 'atlases/bookshelf.json');
  }

  init(data: { player: Player }) {
    this.player = data.player;
  }

  create() {
    super.create();
    this.container.add(this.add.rectangle(0, 0, Config.width, Config.height, 0));

    const texture = this.textures.get('bookshelf');
    const frames = Object.entries(texture.frames);
    const scale = 4;

    for (let i = 1; i < frames.length; i++) {
      const frame = frames[i];

      const source = frame[1].data.spriteSourceSize;
      const image = this.add.image(0, 0, 'bookshelf', frame[1].name).setScale(scale);

      if (i > 1) {
        this.input.enableDebug(image, 0xffff00);
        image.setInteractive(
          new Geom.Rectangle(source.x * scale, source.y * scale, source.w * scale, source.h * scale),
          Geom.Rectangle.Contains
        );

        const glow = image.postFX.addGlow();
        // glow.outerStrength = 0;

        image.on('pointerover', () => {
          // this.tweens.add({
          //   targets: glow,
          //   outerStrength: 4,
          //   duration: 500,
          // });
          image.setTint(0x00ff00);
        });

        image.on('pointerout', () => {
          // this.tweens.add({
          //   targets: glow,
          //   outerStrength: 0,
          //   duration: 500,
          // });
          image.clearTint();
        });
      }

      this.container.add(image);
      this.books.push(image);
    }
  }

  handleSuccess(): void {}
}
