import generateMaze, { Cell } from 'generate-maze';
import { GameObjects, Geom, Math, Scene } from 'phaser';

import { InputManager, Key } from '../../classes/UI/InputManager';
import { Config } from '../../config';
import { MazeDialog } from './MazeDialog';

const cells = 24;
const cellSize = 48;
const stepTime = 140;

export class Maze extends Scene {
  parent: MazeDialog;
  graphics: GameObjects.Graphics;

  keys: InputManager;
  maze: Cell[][];
  mazePlayer: GameObjects.Ellipse;

  nextUpdate: number;

  constructor() {
    super('Maze');
  }

  init(data: { parent: MazeDialog }) {
    this.parent = data.parent;

    this.load.image('maze_player', 'puzzles/maze_player.png');
  }

  create() {
    this.createMaze();

    this.mazePlayer = this.add
      .ellipse(0, 0, cellSize * 0.8, cellSize * 0.8, 0x557799)
      .setSmoothness(32)
      .setOrigin(-0.13);

    this.cameras.main.startFollow(this.mazePlayer);
    this.keys = this.parent.keys;

    this.parent.addTarget(this.graphics);
    this.parent.addTarget(this.mazePlayer);
  }

  getMazeSeed() {
    // getClockRewind(this.parent.player.scene as Game);

    return this.parent.player.gameState.data.mazeSeed || 0;
  }

  createMaze() {
    const seed = this.getMazeSeed();

    this.maze = generateMaze(cells, cells, true, seed);
    this.graphics = this.add.graphics();

    this.graphics.fillStyle(0x993322, 0.5);
    this.graphics.fillRect((cells - 1) * cellSize, (cells - 1) * cellSize, cellSize, cellSize);

    this.graphics.lineStyle(3, 0x33aa33);

    this.maze.forEach((row) => {
      row.forEach((col) => {
        if (col.top) {
          const line = new Geom.Line(col.x * cellSize, col.y * cellSize, col.x * cellSize + cellSize, col.y * cellSize);
          this.graphics.strokeLineShape(line);
        }
        if (col.bottom) {
          const line = new Geom.Line(
            col.x * cellSize,
            col.y * cellSize + cellSize,
            col.x * cellSize + cellSize,
            col.y * cellSize + cellSize
          );
          this.graphics.strokeLineShape(line);
        }
        if (col.left) {
          const line = new Geom.Line(col.x * cellSize, col.y * cellSize, col.x * cellSize, col.y * cellSize + cellSize);
          this.graphics.strokeLineShape(line);
        }
        if (col.right) {
          const line = new Geom.Line(
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

  update(time: number, _delta: number): void {
    if (time < this.nextUpdate) return;

    const keys = this.keys.keys;

    const velocity = new Math.Vector2(0, 0);
    if (keys[Key.Left]) velocity.x = -cellSize;
    else if (keys[Key.Right]) velocity.x = cellSize;
    else if (keys[Key.Up]) velocity.y = -cellSize;
    else if (keys[Key.Down]) velocity.y = cellSize;

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
