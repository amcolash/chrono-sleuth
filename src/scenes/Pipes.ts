import { GameObjects, Math, Scene } from 'phaser';

import { InputManager, Key } from '../classes/InputManager';
import { Config } from '../config';
import { Pipe, PipeShapes, createLevel, getConnectedPipes } from '../utils/pipes';
import { MazeDialog } from './MazeDialog';

const stepTime = 140;

export class Pipes extends Scene {
  parent: MazeDialog;
  graphics: GameObjects.Graphics;

  keys: InputManager;
  pipes: Pipe[][] = [];
  sprites: GameObjects.Container;

  nextUpdate: number;

  constructor() {
    super('Pipes');
  }

  init(data: { parent: MazeDialog }) {
    this.parent = data.parent;
  }

  preload() {
    this.prerenderPipes();
  }

  prerenderPipes() {
    const size = 16; // Size of each block in the pipe
    const pipeTypes = Object.keys(PipeShapes); // Assume pipeShape is defined globally

    pipeTypes.forEach((type) => {
      const shape = PipeShapes[type];
      const key = `pipe_${type}`;
      const canvas = this.textures.createCanvas(key, size * 3, size * 3);

      if (canvas) {
        const ctx = canvas.context;
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < shape.length; i++) {
          for (let j = 0; j < shape[i].length; j++) {
            if (shape[i][j] === 1) {
              ctx.fillRect(j * size, i * size, size, size);
            }
          }
        }

        canvas.refresh();
      }
    });
  }

  create() {
    this.graphics = this.add.graphics();
    this.keys = this.parent.keys;

    this.createPipes();
    this.updatePipes();
  }

  createPipes() {
    const width = 8;
    const height = 8;

    this.pipes = createLevel(width, height);

    this.sprites = this.add.container().setPosition(Config.width / 2 - (width * 60) / 2, 200);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const startEnd = (x === 0 && y === 0) || (x === width - 1 && y === height - 1);
        // if (startEnd) this.pipes[y][x].rotation = 0;

        const key = `pipe_${this.pipes[y][x].type}`;
        const sprite = this.add.sprite(x * 60, y * 60, key).on('pointerdown', () => {
          this.pipes[y][x].rotation = (this.pipes[y][x].rotation + 90) % 360;
          this.updatePipes();
        });

        // if (!startEnd) {
        sprite.setInteractive();
        // }

        this.sprites.add(sprite);
      }
    }
  }

  updatePipes() {
    const connected = getConnectedPipes(this.pipes, 0, 0);

    // Update pipe rotation, tint and check if puzzle solved
    this.pipes.forEach((row) => {
      row.forEach((pipe) => {
        const sprite = this.sprites.getAt(pipe.x + pipe.y * this.pipes[0].length) as GameObjects.Sprite;

        if (sprite) {
          sprite.setAngle(pipe.rotation);

          if (connected.includes(pipe)) {
            sprite.setTint(0x335599);

            if (pipe.x === this.pipes[0].length - 1 && pipe.y === this.pipes.length - 1) {
              this.parent.close(true);
            }
          } else {
            sprite.setTint(0xffffff);
          }
        }
      });
    });
  }
}
