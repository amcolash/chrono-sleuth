import { FX, GameObjects, Geom } from 'phaser';

import { Player } from '../../classes/Player/Player';
import { Config } from '../../config';
import { fastCos } from '../../utils/util';
import { Dialog } from './Dialog';

const GLOW_STRENGTH = 6;

export class Books extends Dialog {
  player: Player;
  books: { image: GameObjects.Image; glow: FX.Glow; strength: number; color: number }[];

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

    this.books = [];

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
        const iScale = 1;
        const padding = 2;
        const rect = new Geom.Rectangle(
          source.x * iScale - padding,
          source.y * iScale - padding,
          source.w * iScale + padding * 2,
          source.h * iScale + padding * 2
        );
        image.setInteractive(rect, Geom.Rectangle.Contains);

        const glow = image.preFX?.addGlow(0xcc0066, 0);
        if (glow) {
          this.books.push({ image, glow, strength: 0, color: 0xcc0066 });

          image.on('pointerover', () => {
            const book = this.books[i - 2];
            book.strength = GLOW_STRENGTH;
            book.color = 0x00ccee;
          });

          image.on('pointerout', () => {
            const book = this.books[i - 2];
            book.strength = 0;
            book.color = 0xcc0066;
          });
        }
      }
    }
  }

  update(time: number, delta: number) {
    super.update(time, delta);
    this.updateBooks(time, delta);
  }

  updateBooks(time: number, delta: number) {
    const EPSILON = 0.001;

    const STRENGTH_SPEED = 0.015;
    const COLOR_SPEED = 0.5;
    const AMBIENT_SPEED = 1.75;

    for (let i = 0; i < this.books.length; i++) {
      const book = this.books[i];

      if (book.strength === 0 && Math.random() > 0.999) book.strength += 0.0001;

      if (book.strength > 0 && book.strength !== GLOW_STRENGTH) {
        book.strength = ((fastCos((time / 1000 + i) * AMBIENT_SPEED) + 1) / 2) * 7;
      }

      // Update glow strength
      const strengthDiff = book.strength - book.glow.outerStrength;
      if (Math.abs(strengthDiff) > EPSILON) {
        let step = STRENGTH_SPEED * delta * Math.sign(strengthDiff);
        book.glow.outerStrength =
          Math.abs(step) > Math.abs(strengthDiff) ? book.strength : book.glow.outerStrength + step;
        book.glow.outerStrength = Phaser.Math.Clamp(book.glow.outerStrength, 0, GLOW_STRENGTH);
      }

      // Extract RGB values manually (no allocations)
      const currentColor = book.glow.color;
      const targetColor = book.color;

      const currentR = (currentColor >> 16) & 0xff;
      const currentG = (currentColor >> 8) & 0xff;
      const currentB = currentColor & 0xff;

      const targetR = (targetColor >> 16) & 0xff;
      const targetG = (targetColor >> 8) & 0xff;
      const targetB = targetColor & 0xff;

      const colorDiffR = targetR - currentR;
      const colorDiffG = targetG - currentG;
      const colorDiffB = targetB - currentB;

      if (Math.abs(colorDiffR) > EPSILON || Math.abs(colorDiffG) > EPSILON || Math.abs(colorDiffB) > EPSILON) {
        const step = COLOR_SPEED * delta; // Fixed step size
        const newR = Math.abs(colorDiffR) > step ? currentR + Math.sign(colorDiffR) * step : targetR;
        const newG = Math.abs(colorDiffG) > step ? currentG + Math.sign(colorDiffG) * step : targetG;
        const newB = Math.abs(colorDiffB) > step ? currentB + Math.sign(colorDiffB) * step : targetB;

        book.glow.color = (newR << 16) | (newG << 8) | newB; // Pack RGB back into integer
      }
    }
  }

  handleSuccess(): void {}
}
