import generateMaze, { Cell } from 'generate-maze';
import { GameObjects, Geom, Input, Math as PhaserMath, Scene, Tilemaps } from 'phaser';

import { InputManager, Key } from '../../classes/UI/InputManager';
import { Config } from '../../config';
import { MazeDialog } from './MazeDialog';

const cells = 24;
const cellSize = 16;
const stepTime = 140;

export class Maze extends Scene {
  parent: MazeDialog;
  graphics: GameObjects.Graphics;
  keys: InputManager;
  maze: Cell[][];
  mazePlayer: GameObjects.Image;
  tilemap: Tilemaps.Tilemap;
  tileset: Tilemaps.Tileset;
  layer: Tilemaps.TilemapLayer;
  nextUpdate: number;

  constructor() {
    super('Maze');
  }

  init(data: { parent: MazeDialog }) {
    this.parent = data.parent;
  }

  preload() {
    this.load.setPath('assets');
    this.load.image('maze_player', 'puzzles/maze/maze_player.png');
    this.load.image('maze_tiles', 'puzzles/maze/maze_tiles.png');
  }

  create() {
    this.createMaze();

    this.mazePlayer = this.add
      .image(0, 0, 'maze_player')
      .setDisplaySize(cellSize / 2, cellSize / 2)
      .setOrigin(-0.5);

    const camera = this.cameras.main;

    camera.setBackgroundColor(0x4b692f);
    camera.startFollow(this.mazePlayer);
    camera.setZoom(4);
    this.keys = this.parent.keys;

    this.parent.addTarget(this.mazePlayer);

    this.input.on(
      'wheel',
      (
        _pointer: Input.Pointer,
        _currentlyOver: GameObjects.GameObject[],
        _deltaX: number,
        deltaY: number,
        _deltaZ: number
      ) => {
        camera.zoom = Math.max(0.01, camera.zoom + deltaY * 0.0005);
      }
    );
  }

  getMazeSeed() {
    return this.parent.player.gameState.data.mazeSeed || 0;
  }

  createMaze() {
    const seed = this.getMazeSeed();

    this.maze = generateMaze(cells, cells, true, seed);

    // Create tilemap and layer
    const map = this.make.tilemap({
      tileWidth: cellSize,
      tileHeight: cellSize,
      width: cells,
      height: cells,
    });

    const tiles = map.addTilesetImage('maze_tiles');
    map.createBlankLayer('layer', tiles!);

    for (let y = 0; y < cells; y++) {
      for (let x = 0; x < cells; x++) {
        const cell = this.maze[y][x];

        const top = cell.top ? 1 : 0;
        const right = cell.right ? 1 : 0;
        const bottom = cell.bottom ? 1 : 0;
        const left = cell.left ? 1 : 0;

        const tile = left + bottom * 2 + right * 4 + top * 8;

        map.putTileAt(tile, x, y);
      }
    }

    // this.drawGraphicsOld();

    this.cameras.main.setViewport(50, 130, Config.width - 100, Config.height - 170);
  }

  drawGraphicsOld() {
    this.graphics = this.add.graphics();

    this.graphics.fillStyle(0x993322, 0.5);
    this.graphics.fillRect((cells - 1) * cellSize, (cells - 1) * cellSize, cellSize, cellSize);

    this.graphics.lineStyle(1, 0x33aa33);

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
  }

  update(time: number, _delta: number): void {
    if (time < this.nextUpdate) return;

    const keys = this.keys.keys;

    const velocity = new PhaserMath.Vector2(0, 0);
    if (keys[Key.Left]) velocity.x = -cellSize;
    else if (keys[Key.Right]) velocity.x = cellSize;
    else if (keys[Key.Up]) velocity.y = -cellSize;
    else if (keys[Key.Down]) velocity.y = cellSize;

    const newPosition = new PhaserMath.Vector2(this.mazePlayer.x + velocity.x, this.mazePlayer.y + velocity.y);

    if ((this.mazePlayer.x !== newPosition.x || this.mazePlayer.y !== newPosition.y) && this.canMove(newPosition)) {
      this.mazePlayer.setPosition(newPosition.x, newPosition.y);

      const endPosition = new PhaserMath.Vector2((cells - 1) * cellSize, (cells - 1) * cellSize);
      this.parent.setAngle(PhaserMath.Angle.BetweenPoints(newPosition, endPosition));

      if (this.mazePlayer.x === endPosition.x && this.mazePlayer.y === endPosition.y) {
        this.parent.close(true);
      }
    }

    this.nextUpdate = time + stepTime;
  }

  canMove(newPosition: PhaserMath.Vector2): boolean {
    const newX = newPosition.x;
    const newY = newPosition.y;

    const x = Math.floor(newX / cellSize);
    const y = Math.floor(newY / cellSize);

    if (x < 0 || y < 0 || x >= cells || y >= cells) return false;

    const currentX = Math.floor(this.mazePlayer.x / cellSize);
    const currentY = Math.floor(this.mazePlayer.y / cellSize);

    const cell = this.maze[currentY][currentX];

    if (cell.top && newY < this.mazePlayer.y) return false;
    if (cell.bottom && newY > this.mazePlayer.y) return false;
    if (cell.left && newX < this.mazePlayer.x) return false;
    if (cell.right && newX > this.mazePlayer.x) return false;

    return true;
  }
}
