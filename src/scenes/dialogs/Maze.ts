import generateMaze, { Cell } from 'generate-maze';
import { GameObjects, Input, Math as PhaserMath, Scene, Tilemaps } from 'phaser';

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

    camera.startFollow(this.mazePlayer);
    camera.setZoom(3);
    camera.setViewport(50, 130, Config.width - 100, Config.height - 170);

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

    const maze = this.maze;
    const n = maze.length; // Number of rows
    const m = maze[0].length; // Number of columns

    // Create an expanded array of size (2n + 1) x (2m + 1), filled with walls ('#')
    const expanded: number[][] = Array.from({ length: 2 * n + 1 }, () => Array(2 * m + 1).fill(1));

    // Populate the expanded array
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        // Place the current cell as an empty tile
        expanded[2 * i + 1][2 * j + 1] = 0;

        // Place empty tiles for unblocked edges
        if (!maze[i][j].top) {
          expanded[2 * i][2 * j + 1] = 0;
        }
        if (!maze[i][j].bottom) {
          expanded[2 * i + 2][2 * j + 1] = 0;
        }
        if (!maze[i][j].left) {
          expanded[2 * i + 1][2 * j] = 0;
        }
        if (!maze[i][j].right) {
          expanded[2 * i + 1][2 * j + 2] = 0;
        }
      }
    }

    const tileSize = expanded.length;

    // Create tilemap and layer
    const map = this.make.tilemap({
      tileWidth: cellSize,
      tileHeight: cellSize,
      width: tileSize,
      height: tileSize,
    });

    const tiles = map.addTilesetImage('maze_tiles');
    const layer = map.createBlankLayer('layer', tiles!)!;
    layer.setScale(0.5);

    this.parent.addTarget(layer);

    for (let y = 0; y < tileSize - 1; y++) {
      for (let x = 0; x < tileSize - 1; x++) {
        const nw = expanded[y]?.[x];
        const ne = expanded[y]?.[x + 1];
        const sw = expanded[y + 1]?.[x];
        const se = expanded[y + 1]?.[x + 1];

        const tile = se + sw * 2 + ne * 4 + nw * 8;

        layer.putTileAt(tile, x, y);
      }
    }

    this.graphics = this.add.graphics();

    this.graphics.fillStyle(0x993322, 0.5);
    this.graphics.fillRect((cells - 1) * cellSize, (cells - 1) * cellSize, cellSize, cellSize);

    // this.drawGraphicsOld();
  }

  // drawGraphicsOld() {
  //   this.graphics.lineStyle(2, 0x33aaaa);

  //   this.maze.forEach((row) => {
  //     row.forEach((col) => {
  //       if (col.top) {
  //         const line = new Geom.Line(col.x * cellSize, col.y * cellSize, col.x * cellSize + cellSize, col.y * cellSize);
  //         this.graphics.strokeLineShape(line);
  //       }
  //       if (col.bottom) {
  //         const line = new Geom.Line(
  //           col.x * cellSize,
  //           col.y * cellSize + cellSize,
  //           col.x * cellSize + cellSize,
  //           col.y * cellSize + cellSize
  //         );
  //         this.graphics.strokeLineShape(line);
  //       }
  //       if (col.left) {
  //         const line = new Geom.Line(col.x * cellSize, col.y * cellSize, col.x * cellSize, col.y * cellSize + cellSize);
  //         this.graphics.strokeLineShape(line);
  //       }
  //       if (col.right) {
  //         const line = new Geom.Line(
  //           col.x * cellSize + cellSize,
  //           col.y * cellSize,
  //           col.x * cellSize + cellSize,
  //           col.y * cellSize + cellSize
  //         );
  //         this.graphics.strokeLineShape(line);
  //       }
  //     });
  //   });
  // }

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
