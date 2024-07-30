import { GameObjects, Math, Scene } from 'phaser';

import { InputManager, Key } from '../classes/InputManager';
import { Config } from '../config';
import { MazeDialog } from './MazeDialog';

enum PipeType {
  Straight,
  Corner,
  T,
  Cross,
}

type Pipe = {
  x: number;
  y: number;
  rotation: 0 | 90 | 180 | 270;
  type: PipeType;
};

const pipeShape = {
  [PipeType.Straight]: [
    [0, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  [PipeType.Corner]: [
    [0, 0, 0],
    [1, 1, 0],
    [0, 1, 0],
  ],
  [PipeType.T]: [
    [0, 0, 0],
    [1, 1, 1],
    [0, 1, 0],
  ],
  [PipeType.Cross]: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 0],
  ],
};

const level = [
  ['C', 'C', 'C', 'C', 'T', 'C', 'C', 'C'],
  ['T', 'X', 'T', 'S', 'T', 'X', 'T', 'T'],
  ['C', 'C', 'S', 'S', 'S', 'C', 'C', 'C'],
  ['C', 'X', 'T', 'S', 'T', 'X', 'T', 'C'],
  ['T', 'S', 'S', 'S', 'S', 'T', 'S', 'T'],
  ['C', 'X', 'C', 'C', 'C', 'X', 'T', 'C'],
  ['T', 'S', 'T', 'S', 'T', 'S', 'T', 'S'],
  ['C', 'X', 'C', 'X', 'C', 'X', 'C', 'C'],
];

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
    const pipeTypes = Object.keys(pipeShape); // Assume pipeShape is defined globally

    pipeTypes.forEach((type) => {
      const shape = pipeShape[type];
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

  getPipeType(letter: string): PipeType {
    switch (letter) {
      case 'S':
        return PipeType.Straight;
      case 'C':
        return PipeType.Corner;
      case 'T':
        return PipeType.T;
      case 'X':
      default:
        return PipeType.Cross;
    }
  }

  createPipes() {
    this.pipes = [];
    const width = level[0].length; // Assuming level is properly defined and accessible
    const height = level.length;
    this.sprites = this.add.container().setPosition(Config.width / 2 - (width * 60) / 2, 200);

    for (let y = 0; y < height; y++) {
      this.pipes[y] = []; // Allocate row for pipes

      for (let x = 0; x < width; x++) {
        const type = this.getPipeType(level[y][x]); // Access using y for rows and x for columns

        this.pipes[y][x] = {
          x,
          y,
          type,
          rotation: Phaser.Math.Between(0, 3) * 90, // Ensure Phaser.Math.Between is correctly referenced
        };

        const startEnd = (x === 0 && y === 0) || (x === width - 1 && y === height - 1);

        const key = `pipe_${type}`;
        const sprite = this.add
          .sprite(x * 60, y * 60, key)
          .setInteractive()
          .on('pointerdown', () => {
            this.pipes[y][x].rotation = (this.pipes[y][x].rotation + 90) % 360;
            this.updatePipes();
          });

        if (startEnd) {
          sprite.setTint(0x00ff00);
        } else {
          sprite.setInteractive();
        }

        this.sprites.add(sprite);
      }
    }
  }

  updatePipes() {
    // Update pipe rotation
    this.pipes.forEach((row) => {
      row.forEach((pipe) => {
        const sprite = this.sprites.getAt(pipe.x + pipe.y * level[0].length) as GameObjects.Sprite;
        sprite.setAngle(pipe.rotation);
      });
    });
  }

  // update(time: number, _delta: number): void {
  //   if (time < this.nextUpdate) return;

  //   const keys = this.keys.keys;

  //   this.nextUpdate = time + stepTime;
  // }

  // isConnected(pipe1: Pipe, pipe2: Pipe): boolean {}
}
