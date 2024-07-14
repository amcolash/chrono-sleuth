import generateMaze, { Cell } from 'generate-maze';
import { GameObjects, Input, Math, Scene } from 'phaser';

import { Config } from '../config';
import { MazeDialog } from './MazeDialog';

const cells = 36;
const cellSize = 32;
const stepTime = 50;

export class Maze extends Scene {
  parent: MazeDialog;
  graphics: GameObjects.Graphics;

  keys: { [key: string]: Input.Keyboard.Key };
  maze: Cell[][];
  mazePlayer: GameObjects.Ellipse;

  nextUpdate: number;

  constructor() {
    super('Maze');
  }

  init(data: { parent: MazeDialog }) {
    this.parent = data.parent;
  }

  create() {
    this.createMaze();

    const half = cellSize * 0.5;
    this.mazePlayer = this.add
      .ellipse(0, 0, cellSize * 0.9, cellSize * 0.9, 0x557799)
      .setSmoothness(32)
      .setOrigin(-0.03);

    this.keys = this.input.keyboard?.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,P') as {
      [key: string]: Phaser.Input.Keyboard.Key;
    };

    this.cameras.main.startFollow(this.mazePlayer);
  }

  createMaze() {
    this.maze = generateMaze(cells, cells, true, 12345);
    this.graphics = this.add.graphics();

    this.graphics.fillStyle(0x993322, 0.5);
    this.graphics.fillRect((cells - 1) * cellSize, (cells - 1) * cellSize, cellSize, cellSize);

    this.graphics.lineStyle(2, 0x33aa33);

    this.maze.forEach((row) => {
      row.forEach((col) => {
        if (col.top) {
          const line = new Phaser.Geom.Line(
            col.x * cellSize,
            col.y * cellSize,
            col.x * cellSize + cellSize,
            col.y * cellSize
          );
          this.graphics.strokeLineShape(line);
        }
        if (col.bottom) {
          const line = new Phaser.Geom.Line(
            col.x * cellSize,
            col.y * cellSize + cellSize,
            col.x * cellSize + cellSize,
            col.y * cellSize + cellSize
          );
          this.graphics.strokeLineShape(line);
        }
        if (col.left) {
          const line = new Phaser.Geom.Line(
            col.x * cellSize,
            col.y * cellSize,
            col.x * cellSize,
            col.y * cellSize + cellSize
          );
          this.graphics.strokeLineShape(line);
        }
        if (col.right) {
          const line = new Phaser.Geom.Line(
            col.x * cellSize + cellSize,
            col.y * cellSize,
            col.x * cellSize + cellSize,
            col.y * cellSize + cellSize
          );
          this.graphics.strokeLineShape(line);
        }
      });
    });

    this.cameras.main.setViewport(50, 130, Config.width - 100, Config.height - 170);
  }

  update(time: number, delta: number): void {
    if (time < this.nextUpdate) return;

    // Skip the maze if in development mode
    if (this.keys.P.isDown && import.meta.env.MODE !== 'production') {
      this.parent.close(true);
    }

    const keys = {
      left: this.keys.LEFT.isDown || this.keys.A.isDown,
      right: this.keys.RIGHT.isDown || this.keys.D.isDown,
      up: this.keys.UP.isDown || this.keys.W.isDown,
      down: this.keys.DOWN.isDown || this.keys.S.isDown,
    };

    const velocity = new Math.Vector2(0, 0);
    if (keys.left) velocity.x = -cellSize;
    if (keys.right) velocity.x = cellSize;
    if (keys.up) velocity.y = -cellSize;
    if (keys.down) velocity.y = cellSize;

    const newX = this.mazePlayer.x + velocity.x;
    const newY = this.mazePlayer.y + velocity.y;

    if ((this.mazePlayer.x !== newX || this.mazePlayer.y !== newY) && this.canMove(newX, newY)) {
      this.mazePlayer.setPosition(this.mazePlayer.x + velocity.x, this.mazePlayer.y + velocity.y);

      if (this.mazePlayer.x === (cells - 1) * cellSize && this.mazePlayer.y === (cells - 1) * cellSize) {
        this.parent.close(true);
      }
    }

    this.nextUpdate = time + stepTime;
  }

  canMove(newX: number, newY: number): boolean {
    const x = Math.FloorTo(newX / cellSize);
    const y = Math.FloorTo(newY / cellSize);

    if (x < 0 || y < 0 || x >= cells || y >= cells) return false;

    const currentX = Math.FloorTo(this.mazePlayer.x / cellSize);
    const currentY = Math.FloorTo(this.mazePlayer.y / cellSize);

    const cell = this.maze[currentY][currentX];

    if (cell.top && newY < this.mazePlayer.y) return false;
    if (cell.bottom && newY > this.mazePlayer.y) return false;
    if (cell.left && newX < this.mazePlayer.x) return false;
    if (cell.right && newX > this.mazePlayer.x) return false;

    return true;
  }
}
