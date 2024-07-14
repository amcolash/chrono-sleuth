import generateMaze, { Cell } from 'generate-maze';
import { GameObjects, Input, Math, Scene } from 'phaser';

import { Config } from '../config';
import { getClockRewind } from '../utils/interactionUtils';
import { MazeDialog } from './MazeDialog';

const cells = 24;
const cellSize = 48;
const stepTime = 75;

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
    const seed = getClockRewind(this);

    this.maze = generateMaze(cells, cells, true, seed);
    this.graphics = this.add.graphics();

    this.graphics.fillStyle(0x993322, 0.5);
    this.graphics.fillRect((cells - 1) * cellSize, (cells - 1) * cellSize, cellSize, cellSize);

    this.graphics.lineStyle(3, 0x33aa33);

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
    else if (keys.right) velocity.x = cellSize;
    else if (keys.up) velocity.y = -cellSize;
    else if (keys.down) velocity.y = cellSize;

    const newPosition = new Math.Vector2(this.mazePlayer.x + velocity.x, this.mazePlayer.y + velocity.y);

    if ((this.mazePlayer.x !== newPosition.x || this.mazePlayer.y !== newPosition.y) && this.canMove(newPosition)) {
      this.mazePlayer.setPosition(newPosition.x, newPosition.y);

      const endPosition = new Math.Vector2((cells - 1) * cellSize, (cells - 1) * cellSize);
      this.parent.setAngle(Math.Angle.BetweenPoints(newPosition, endPosition));

      if (this.mazePlayer.x === endPosition.x && this.mazePlayer.y === endPosition.y) {
        this.parent.close(true);
      }
    }

    this.nextUpdate = time + stepTime;
  }

  canMove(newPosition: Math.Vector2): boolean {
    // return true;

    const newX = newPosition.x;
    const newY = newPosition.y;

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
