import { FX, GameObjects, Geom } from 'phaser';

import { Player } from '../../classes/Player/Player';
import { Config } from '../../config';
import { Dialog } from './Dialog';

const GLOW_STRENGTH = 4;

export class Books extends Dialog {
  player: Player;
  books: { image: GameObjects.Image; glow: FX.Glow; target: number }[] = [];

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
      this.container.add(image);

      if (i > 1) {
        this.input.enableDebug(image, 0xffff00);

        const iScale = 1;
        const rect = new Geom.Rectangle(source.x * iScale, source.y * iScale, source.w * iScale, source.h * iScale);
        image.setInteractive(rect, Geom.Rectangle.Contains);

        const glow = image.postFX.addGlow();
        glow.outerStrength = 0;

        this.books.push({ image, glow, target: 0 });

        image.on('pointerover', () => {
          this.books[i - 2].target = GLOW_STRENGTH;
        });

        image.on('pointerout', () => {
          this.books[i - 2].target = 0;
        });
      }
    }
  }

  update(time: number, delta: number) {
    super.update(time, delta);

    for (let i = 0; i < this.books.length; i++) {
      const book = this.books[i];

      if (book.glow.outerStrength === book.target) continue;

      if (book.glow.outerStrength < book.target) book.glow.outerStrength += 0.05 * delta;
      else if (book.glow.outerStrength > book.target) book.glow.outerStrength -= 0.05 * delta;

      book.glow.outerStrength = Phaser.Math.Clamp(book.glow.outerStrength, 0, GLOW_STRENGTH);
    }
  }

  handleSuccess(): void {}
}
