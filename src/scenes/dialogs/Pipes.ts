import { Display, GameObjects, Math as PhaserMath, Scene, Types } from 'phaser';

import { Cursor } from '../../classes/UI/Cursor';
import { InputManager } from '../../classes/UI/InputManager';
import { Config } from '../../config';
import { pipeList } from '../../data/arrays';
import { Colors, getColorNumber, getColorObject } from '../../utils/colors';
import { Pipe, PipeShapes, PipeType, getConnectedPipes, level, startPipe } from '../../utils/pipes';
import { tweenColor } from '../../utils/util';
import { MazeDialog } from './MazeDialog';

const width = 16;
const height = 8;

export class Pipes extends Scene {
  parent: MazeDialog;

  keys: InputManager;
  pipes: Pipe[][] = [];
  totalPipes: number = 0;
  images: GameObjects.Image[] = [];
  container: GameObjects.Container;

  blockSize: number;
  pipeSize: number;

  initialized: boolean = false;

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
    for (const type of pipeList) {
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
    this.keys = this.parent.keys;
    this.container = this.add.container();
    this.createPipes();

    const regions: Types.Math.Vector2Like[][] = [];
    for (let y = 0; y < height - 2; y++) {
      regions.push([]);
      for (let x = 0; x < width - 2; x++) {
        regions[y].push({ x: (x + 1) * this.pipeSize, y: (y + 1) * this.pipeSize });
      }
    }

    const cursor = new Cursor(
      this,
      {
        regions,
        size: this.pipeSize,
        keyHandler: (pos) => {
          const pipe = this.pipes[pos.y + 1][pos.x + 1];
          if (pipe.interactive) {
            pipe.rotation = (pipe.rotation + 90) % 360;
            this.updatePipes();
          }
        },
      },
      this.keys
    );
    this.container.add(cursor);
  }

  createPipes() {
    this.pipes = [];

    this.container = this.add
      .container()
      .setPosition(Config.width / 2 - (width * this.pipeSize) / 2 + this.pipeSize / 2, Config.height / 4);

    this.totalPipes = 0;

    const delay = 5;

    // initialize pipes and add them in a delayed manner
    for (let y = 0; y < height; y++) {
      if (!this.pipes[y]) this.pipes[y] = [];

      for (let x = 0; x < width; x++) {
        // Access using y for rows and x for columns
        let type = level[y][x];

        const onBorder = x === 0 || y === 0 || x === width - 1 || y === height - 1;
        const last = x === width - 1 && y === height - 1;
        const interactive = !onBorder;

        this.pipes[y][x] = {
          x,
          y,
          type,
          rotation: onBorder ? 0 : PhaserMath.Between(0, 3) * 90,
          interactive,
        };

        if (type !== PipeType.Empty) this.totalPipes++;

        const index = x + y * level[0].length;
        this.time.delayedCall(50 + index * delay, () => {
          const key = `pipe_${type}`;
          const image = this.add.image(x * this.pipeSize, y * this.pipeSize, key).on('pointerdown', () => {
            if (this.initialized) {
              this.pipes[y][x].rotation = (this.pipes[y][x].rotation + 90) % 360;
              this.updatePipes();
            }
          });

          image.setAlpha(0).setScale(0.5).setAngle(this.pipes[y][x].rotation);
          this.tweens.add({
            targets: image,
            alpha: 1,
            scale: 1,
            duration: 300,
            onComplete: last
              ? () => {
                  this.initialized = true;
                  this.updatePipes();
                }
              : undefined,
          });

          if (interactive) image.setInteractive();
          else image.setTint(0x666666);

          this.container.add(image);
          this.images.push(image);
        });
      }
    }

    this.parent.additionalUI.push(this.container);
  }

  updatePipes() {
    const connected = getConnectedPipes(this.pipes, startPipe.x, startPipe.y);

    // Update pipe rotation and check if puzzle solved
    this.pipes.forEach((row) => {
      row.forEach((pipe) => {
        const sprite = this.images[pipe.x + pipe.y * level[0].length];
        sprite.setAngle(pipe.rotation);
      });
    });

    if (connected.length === this.totalPipes) {
      this.parent.close(true);
    }
  }

  completed(closeHandler?: () => void) {
    const total = this.images.length;
    const start = new Display.Color(255, 255, 255);
    const end = getColorObject(getColorNumber(Colors.Teal));

    for (let i = 0; i < total; i++) {
      const sprite = this.images[i];
      const last = i === total - 1;

      tweenColor(this, start, end, (color) => sprite.setTint(color), {
        duration: 500,
        delay: i * 10,
        hold: 1000,
        onComplete: last ? closeHandler : undefined,
      });
    }
  }
}
