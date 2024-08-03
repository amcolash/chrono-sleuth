import { GameObjects, Math as PhaserMath, Scene } from 'phaser';

import { InputManager, Key } from '../classes/UI/InputManager';
import { Config } from '../config';
import { Colors, getColorNumber } from '../utils/colors';
import { Pipe, PipeShapes, PipeType, Rotation, getConnectedPipes, level } from '../utils/pipes';
import { getRandomElement } from '../utils/util';
import { MazeDialog } from './MazeDialog';

// TODO: Maybe this should be like nancy drew instead, where every single pipe needs to be connected to solve the puzzle
// https://the-spoiler.com/ADVENTURE/Her.interactive/nancy.drew.last.train.to.blue.moon.canyon.1/Nancy%20Drew%2013%20Last%20train%20to%20Blue%20Moon%20Canyon_files/sleepingcarpipes.jpg?ezimgfmt=rs:282x166/rscb1/ng:webp/ngcb1
// https://the-spoiler.com/ADVENTURE/Her.interactive/nancy.drew.last.train.to.blue.moon.canyon.1/Nancy%20Drew%2013%20Last%20train%20to%20Blue%20Moon%20Canyon_files/ornategrillpipes.jpg?ezimgfmt=rs:285x172/rscb1/ng:webp/ngcb1
// https://the-spoiler.com/ADVENTURE/Her.interactive/nancy.drew.last.train.to.blue.moon.canyon.1/Nancy%20Drew%2013%20Last%20train%20to%20Blue%20Moon%20Canyon_files/Jake'scarpipes.jpg?ezimgfmt=rs:272x156/rscb1/ng:webp/ngcb1

const width = 16;
const height = 8;

export class Pipes extends Scene {
  parent: MazeDialog;
  graphics: GameObjects.Graphics;

  cursor: GameObjects.Rectangle;
  position: PhaserMath.Vector2;

  keys: InputManager;
  pipes: Pipe[][] = [];
  images: GameObjects.Container;

  blockSize: number;
  pipeSize: number;
  nextUpdate: number = 0;

  constructor() {
    super('Pipes');
  }

  init(data: { parent: MazeDialog }) {
    this.parent = data.parent;

    this.blockSize = Config.zoomed ? 13 : 17;
    this.pipeSize = this.blockSize * 3.75;
  }

  preload() {
    // TODO: It might be better to set scale of images when zoom changes instead of re-generating textures each time
    this.prerenderPipes();
  }

  prerenderPipes() {
    for (const type of Object.values(PipeType).filter((value) => typeof value !== 'number')) {
      const shape = PipeShapes[type as PipeType];
      const key = `pipe_${type}`;

      if (this.textures.exists(key)) this.textures.remove(key);
      const canvas = this.textures.createCanvas(key, this.blockSize * 3, this.blockSize * 3);

      if (canvas) {
        const ctx = canvas.context;
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < shape.length; i++) {
          for (let j = 0; j < shape[i].length; j++) {
            if (shape[i][j] === 1) {
              ctx.fillRect(j * this.blockSize, i * this.blockSize, this.blockSize, this.blockSize);
            }
          }
        }

        canvas.refresh();
      }
    }
  }

  create() {
    this.graphics = this.add.graphics();
    this.keys = this.parent.keys;

    this.cursor = this.add
      .rectangle(100, 100, this.pipeSize, this.pipeSize, 0, 0)
      .setStrokeStyle(2, getColorNumber(Colors.Tan), 0.75)
      .setVisible(false);
    this.position = new PhaserMath.Vector2(0, 0);

    this.createPipes();
    this.updatePipes();
  }

  createPipes() {
    this.pipes = [];

    this.images = this.add
      .container()
      .setPosition(Config.width / 2 - (width * this.pipeSize) / 2 + this.pipeSize / 2, Config.height / 4);

    for (let y = 0; y < height; y++) {
      if (!this.pipes[y]) this.pipes[y] = [];

      for (let x = 0; x < width; x++) {
        // Access using y for rows and x for columns
        let type = level[y][x];

        const start = x === 0 && y === 0;
        const end = x === width - 1 && y === height - 1;

        let interactive = !start && !end;

        if (type === PipeType.Empty && Math.random() < 0.9) {
          type = getRandomElement(Object.values(PipeType).filter((value) => typeof value !== 'number'));
          // reduce the chance of cross pipes
          if (type === PipeType.Cross && Math.random() < 0.5) type = PipeType.T;

          if (Math.random() < 0.25) interactive = false;
        }

        this.pipes[y][x] = {
          x,
          y,
          type,
          rotation: PhaserMath.Between(0, 3) * 90,
          interactive,
        };

        if (start) this.pipes[y][x].rotation = Rotation.Up;
        if (end) this.pipes[y][x].rotation = Rotation.Down;

        const key = `pipe_${type}`;
        const iamge = this.add.image(x * this.pipeSize, y * this.pipeSize, key).on('pointerdown', () => {
          this.cursor.setVisible(false);
          this.pipes[y][x].rotation = (this.pipes[y][x].rotation + 90) % 360;
          this.updatePipes();
        });

        if (interactive) iamge.setInteractive();

        this.images.add(iamge);
      }
    }
  }

  updatePipes() {
    const connected = getConnectedPipes(this.pipes, 0, 0);

    // Update pipe rotation, tint and check if puzzle solved
    this.pipes.forEach((row) => {
      row.forEach((pipe) => {
        const sprite = this.images.getAt(pipe.x + pipe.y * level[0].length) as GameObjects.Sprite;
        sprite.setAngle(pipe.rotation);

        if (connected.includes(pipe)) {
          if (pipe.interactive) {
            sprite.setTint(0x335599);
          } else {
            sprite.setTint(0x002255);
          }

          // Check if the last pipe is connected: win condition
          if (pipe.x === level[0].length - 1 && pipe.y === level.length - 1) {
            this.parent.time.delayedCall(500, () => {
              this.parent.close(true);
            });
          }
        } else {
          if (pipe.interactive) {
            sprite.setTint(0xffffff);
          } else {
            sprite.setTint(0x666666);
          }
        }
      });
    });
  }

  update(time: number, _delta: number): void {
    if (time < this.nextUpdate) return;
    let handled = true;

    const keys = this.keys.keys;
    if (keys[Key.Continue]) {
      const pipe = this.pipes[this.position.y][this.position.x];
      pipe.rotation = (pipe.rotation + 90) % 360;
      this.updatePipes();
    } else if (keys[Key.Left]) this.position.x = Math.max(0, this.position.x - 1);
    else if (keys[Key.Right]) this.position.x = Math.min(width, this.position.x + 1);
    else if (keys[Key.Up]) this.position.y = Math.max(0, this.position.y - 1);
    else if (keys[Key.Down]) this.position.y = Math.min(height, this.position.y + 1);
    else handled = false;

    if (handled) {
      this.nextUpdate = time + 200;
      this.cursor.setVisible(true);
      this.cursor.setPosition(
        this.images.x + this.position.x * this.pipeSize,
        this.images.y + this.position.y * this.pipeSize
      );
    }
  }
}
