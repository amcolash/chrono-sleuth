import { FX, GameObjects, Geom } from 'phaser';

import { Player } from '../../classes/Player/Player';
import { Button } from '../../classes/UI/Button';
import { Cursor, Region } from '../../classes/UI/Cursor';
import { IconButton } from '../../classes/UI/IconButton';
import { Message } from '../../classes/UI/Message';
import { Config } from '../../config';
import { ItemType } from '../../data/types';
import { Colors, getColorNumber } from '../../utils/colors';
import { fontStyle, noteStyle } from '../../utils/fonts';
import { hasItem } from '../../utils/interactionUtils';
import { Dialog } from './Dialog';

const GLOW_STRENGTH = 6;

const bookNames = [
  'The Forgotten Aeon',
  'Taming the Wild Griffin',
  'Surrender to the Starlit Realm',
  'The Creation of Time',
  'The Eternal End',
  'The Bard’s Forbidden Melody',
  'Bound by Fate and Fire',
  'Secrets of the Fifth Element',
  'The Enchanted Knight’s Oath',
  'A Potion for Yesterday',
  'Chronomancer’s Dilemma',
  'Tome of the Lost Hours',
  'The Midnight Convergence',
  'The Rogue’s Tempting Treasure',
  'Whispers of the Moonlit Grove',
  'The Sorcerer’s Gentle Caress',
  'The Elixir That Binds',
  'Transmutation of the Soul',
  'The Philosopher’s Vice',
  'The Silver Circle’s Curse',
  'A Mage’s Soft Touch',
  'The Alchemist’s Second Life',
  'The Thaumaturge’s Gambit',
  'Through the Alchemist’s Looking Glass',
  'Legends of the Velvet Throne',
];

const bookOrder = [
  bookNames.indexOf('The Creation of Time'),
  bookNames.indexOf('Chronomancer’s Dilemma'),
  bookNames.indexOf('Transmutation of the Soul'),
  bookNames.indexOf('The Eternal End'),
];

export class Books extends Dialog {
  player: Player;
  books: { image: GameObjects.Image; glow: FX.Glow; strength: number; name: string }[];
  message: Message;
  answer: number[];

  bookshelf: GameObjects.Image;
  door: GameObjects.Image;
  debug: GameObjects.GameObject[];

  constructor() {
    super({ key: 'Books', title: 'Books', gamepadVisible: false, skipUI: true });
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
    this.message = new Message(this);
    this.answer = [];
    this.debug = [];

    this.container.add(this.add.rectangle(0, 0, Config.width, Config.height, 0));

    const hasNote = hasItem(this.player, ItemType.Note);
    this.createBookshelf(hasNote);

    this.container.add(
      new Button(this, Config.width * 0.47, Config.height * -0.43, 'X', () => this.close(false), {
        ...fontStyle,
        backgroundColor: undefined,
        fontSize: 54,
      })
    );

    if (!Config.prod && !this.dialogData.hideCloseSuccess) {
      const button = new IconButton(this, Config.width * 0.467, Config.height * -0.3, 'award', () => this.close(true));
      button.rect.fillColor = 0x00000000;
      button.rect.strokeColor = 0x000000;
      this.container.add(button);
    }

    if (hasNote) {
      this.time.delayedCall(200, () => {
        this.message.setDialog(
          {
            messages: [
              'This note seems to be a clue of some sort. Maybe it has to do with some sort of ordering for the books on the shelf.',
            ],
          },
          undefined,
          'player_portrait'
        );
      });

      const image = this.add.image(0, 0, 'props', 'paper').setScale(1.6, 2.25).setAngle(90);
      image.setPosition(20 + image.displayHeight / 2, 5 + image.displayWidth / 2);
      this.addTarget(image);

      const text = this.add
        .text(
          70,
          50,
          [
            'A spiral marks the heart of the sequence.',
            'Time begins with "Creation" and ends in "Eternity".',
            'A blue tome, near the center, waits before the final touch.',
          ].join('\n\n'),
          {
            ...noteStyle,
            fontSize: 36,
          }
        )
        .setWordWrapWidth(260);
      this.addTarget(text);
    }

    this.fadeIn();
  }

  createBookshelf(hasNote: boolean) {
    const texture = this.textures.get('bookshelf');
    const frames = Object.entries(texture.frames);
    const regions: Region[][] = [];

    const scale = 4;
    const xOffset = hasNote ? 150 : 0;

    this.bookshelf = this.add.image(xOffset, 0, 'bookshelf', 'Bookshelf-0').setScale(scale).setTint(0x666666);
    this.container.add(this.bookshelf);

    this.door = this.add.image(xOffset, 0, 'bookshelf', 'Door-0').setScale(scale).setTint(0x666666);
    this.container.add(this.door);

    const books = frames
      .filter((frame) => frame[1].name.startsWith('Book_'))
      .sort((a, b) => {
        const aName = Number(a[1].name.replace('Book_', '').replace('-0', ''));
        const bName = Number(b[1].name.replace('Book_', '').replace('-0', ''));

        return aName - bName;
      });
    for (let i = 0; i < books.length; i++) {
      const frame = books[i];

      const image = this.add.image(xOffset, 0, 'bookshelf', frame[1].name).setScale(scale);
      image.setData({ index: i });
      this.container.add(image);
      const padding = 2;

      const source = frame[1].data.spriteSourceSize;
      const rect = new Geom.Rectangle(
        source.x - padding,
        source.y - padding,
        source.w + padding * 2,
        source.h + padding * 2
      );
      image.setInteractive({ hitArea: rect, hitAreaCallback: Geom.Rectangle.Contains, cursor: 'pointer' });

      const y = Math.floor(i / 4);
      if (regions[y] === undefined) regions.push([]);
      regions[y].push({
        x: -1,
        y: -1,
        width: -1,
        height: -1,
        object: image,
      });

      const glow = image.preFX?.addGlow(getColorNumber(Colors.Tan), 0);
      if (glow) {
        this.books.push({ image, glow, strength: 0, name: bookNames[i] });

        image.on('pointerover', () => {
          this.books[i].strength = GLOW_STRENGTH;
        });

        image.on('pointerout', () => {
          if (!this.answer.includes(i)) this.books[i].strength = 0;
        });

        image.on('pointerdown', () => {
          this.handleClick(i);
        });

        if (!Config.prod && hasNote) {
          if (bookOrder.includes(i)) {
            const debug = this.add
              .text(
                rect.x * 4 - xOffset + 40,
                rect.y * 4 - Config.height / 2 + 40,
                (bookOrder.indexOf(i) + 1).toString(),
                fontStyle
              )
              .setAlpha(0.5);

            this.container.add(debug);
            this.debug.push(debug);
          }
        }
      }
    }

    const cursor = new Cursor(
      this,
      {
        regions,
        onSelect: (_pos, region) => {
          if (region?.object && !this.message.visible) {
            const index = region.object.getData('index');
            this.handleClick(index);
          }
        },
        onChange: (_pos, region) => {
          if (region?.object) {
            const index = region.object.getData('index');

            this.books.forEach((book, i) => {
              if (!this.answer.includes(i)) book.strength = i === index ? GLOW_STRENGTH : 0;
            });
          }
        },
        hidden: true,
      },
      this.keys
    );
    this.container.add(cursor);
  }

  handleClick(i: number) {
    const hasNote = hasItem(this.player, ItemType.Note);
    const correct = bookOrder[this.answer.length] === i && hasNote;

    const messages = [this.books[i].name];
    if (correct) messages.push('<b><i>[CLUNK]</i></b> The book shifts slightly.');

    this.message.setDialog(
      {
        messages,
        mute: correct ? [1] : undefined,
        onMessageShown: (_player, index, _target) => {
          if (index === 1) this.sound.playAudioSprite('sfx', 'safe_click');
        },
        onCompleted: correct
          ? () => {
              this.answer.push(i);
              this.books[i].strength = GLOW_STRENGTH;
              this.books[i].glow.color = getColorNumber(Colors.Success);
              if (this.answer.length === bookOrder.length) {
                this.close(true);
              }
            }
          : () => {
              this.answer = [];
              this.books.forEach((book) => {
                book.glow.color = getColorNumber(Colors.Tan);
                book.strength = 0;
              });
            },
      },
      undefined,
      'player_portrait'
    );
  }

  update(time: number, delta: number) {
    super.update(time, delta);
    this.updateBooks(time, delta);
  }

  updateBooks(_time: number, delta: number) {
    if (this.message.visible) return;

    const EPSILON = 0.001;

    const STRENGTH_SPEED = 0.015;

    for (let i = 0; i < this.books.length; i++) {
      const book = this.books[i];

      // Update glow strength
      const strengthDiff = book.strength - book.glow.outerStrength;
      if (Math.abs(strengthDiff) > EPSILON) {
        let step = STRENGTH_SPEED * delta * Math.sign(strengthDiff);
        book.glow.outerStrength =
          Math.abs(step) > Math.abs(strengthDiff) ? book.strength : book.glow.outerStrength + step;
        book.glow.outerStrength = Phaser.Math.Clamp(book.glow.outerStrength, 0, GLOW_STRENGTH);
      }
    }
  }

  handleSuccess(success: boolean): void {
    if (success) this.player.inventory.useItem(ItemType.Note);
  }

  close(success: boolean): void {
    this.books.forEach((book) => {
      book.strength = 0;
      book.image.destroy();
    });
    this.debug.forEach((debug) => debug.destroy());

    this.bookshelf.setTint(getColorNumber(Colors.White));
    this.door.setTint(getColorNumber(Colors.White));

    if (!success) {
      super.close(false);
      return;
    }

    const delay = 400;
    this.add
      .timeline([
        {
          at: delay + 0,
          run: () => {
            this.sound.playAudioSprite('sfx', 'safe_open');
          },
        },
        {
          at: delay + 250,
          run: () => this.door.setFrame('Door-1'),
        },
        {
          at: delay + 500,
          run: () => this.door.setFrame('Door-2'),
        },
        {
          at: delay + 1400,
          run: () =>
            this.message.setDialog(
              {
                messages: ['It looks like there is a secret room behind the bookshelf!'],
                onCompleted: () => super.close(true),
              },
              undefined,
              'player_portrait'
            ),
        },
      ])
      .play();
  }
}
