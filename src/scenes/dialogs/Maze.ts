import generateMaze, { Cell } from 'generate-maze';
import { GameObjects, Input, Math as PhaserMath, Scene } from 'phaser';

import { InputManager, Key } from '../../classes/UI/InputManager';
import { Config } from '../../config';
import { MazeDialog } from './MazeDialog';

const cells = 24;
const cellSize = 16;
const stepTime = 140;

export class Maze extends Scene {
  parent: MazeDialog;
  keys: InputManager;

  maze: Cell[][];

  mazePlayer: GameObjects.Image;
  playerPosition: PhaserMath.Vector2 = new PhaserMath.Vector2(0, 0);
  nextUpdate: number;

  audioThrottle: number = 0;

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

    this.playerPosition.set(0, 0);
    this.mazePlayer = this.add
      .image(this.playerPosition.x, this.playerPosition.y, 'maze_player')
      .setDisplaySize(cellSize / 2, cellSize / 2)
      .setOrigin(-0.5);

    const camera = this.cameras.main;

    camera.startFollow(this.mazePlayer);
    camera.setZoom(5);
    camera.setViewport(50, 130, Config.width - 100, Config.height - 170);

    this.keys = this.parent.keys;

    this.parent.addTarget(this.mazePlayer);

    if (!Config.prod) {
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

    // Open the entrance and exit walls
    expanded[0][0] = 0;
    expanded[1][0] = 0;
    expanded[0][1] = 0;

    expanded[2 * n][2 * m] = 0;
    expanded[2 * n - 1][2 * m] = 0;
    expanded[2 * n][2 * m - 1] = 0;

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
  }

  update(time: number, _delta: number): void {
    if (time < this.nextUpdate) return;

    const keys = this.keys.keys;

    const velocity = new PhaserMath.Vector2(0, 0);
    if (keys[Key.Left]) velocity.x = -cellSize;
    else if (keys[Key.Right]) velocity.x = cellSize;
    else if (keys[Key.Up]) velocity.y = -cellSize;
    else if (keys[Key.Down]) velocity.y = cellSize;

    const newPosition = new PhaserMath.Vector2(this.playerPosition.x + velocity.x, this.playerPosition.y + velocity.y);
    const endPosition = new PhaserMath.Vector2((cells - 1) * cellSize, (cells - 1) * cellSize);

    if (
      (this.playerPosition.x !== newPosition.x || this.playerPosition.y !== newPosition.y) &&
      this.canMove(newPosition)
    ) {
      if (Date.now() > this.audioThrottle) {
        this.sound.playAudioSprite('sfx', 'ladder', { volume: 0.5 });
        this.audioThrottle = Date.now() + 250;
      }

      this.mazePlayer.setPosition(this.playerPosition.x, this.playerPosition.y);
      this.playerPosition.set(newPosition.x, newPosition.y);

      this.tweens.killTweensOf(this.mazePlayer);
      this.tweens.add({
        targets: this.mazePlayer,
        x: newPosition.x,
        y: newPosition.y,
        duration: stepTime,
      });

      this.parent.setAngle(PhaserMath.Angle.BetweenPoints(newPosition, endPosition));
    }

    if (this.playerPosition.x === endPosition.x && this.playerPosition.y === endPosition.y) {
      this.parent.close(true);
    }

    this.nextUpdate = time + stepTime;
  }

  canMove(newPosition: PhaserMath.Vector2): boolean {
    const newX = newPosition.x;
    const newY = newPosition.y;

    const x = Math.floor(newX / cellSize);
    const y = Math.floor(newY / cellSize);

    if (x < 0 || y < 0 || x >= cells || y >= cells) return false;

    const currentX = Math.floor(this.playerPosition.x / cellSize);
    const currentY = Math.floor(this.playerPosition.y / cellSize);

    const cell = this.maze[currentY][currentX];
    if (!cell) return false;

    if (cell.top && newY < this.playerPosition.y) return false;
    if (cell.bottom && newY > this.playerPosition.y) return false;
    if (cell.left && newX < this.playerPosition.x) return false;
    if (cell.right && newX > this.playerPosition.x) return false;

    return true;
  }
}
