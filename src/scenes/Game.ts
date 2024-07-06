import { Player } from '../classes/Player';
import { Warp } from '../classes/Warp';
import { ItemType, NPCType, WarpType } from '../classes/types.';
import { NPC } from '../classes/NPC';
import { GameObjects, Scene } from 'phaser';
import { Item } from '../classes/Item';
import { Walls } from '../classes/Walls';
import { Clock } from '../classes/Clock';

export class Game extends Scene {
  player: Player;
  interactiveObjects: GameObjects.Group;
  clock: Clock;

  constructor() {
    super('Game');
  }

  create() {
    // background
    this.createBackgrounds();

    // game objects
    this.player = new Player(this, 400, 650);

    const walls = new Walls(this);
    const warpers = this.createWarpers();
    const npcs = this.createNpcs();
    const items = this.createItems();

    // rewindable objects
    const rewindable = [this.player];
    this.clock = new Clock(this, rewindable, this.player);

    // interactive objects
    this.interactiveObjects = this.add.group([...warpers, ...npcs, ...items], { runChildUpdate: true });

    // update items added to the group
    this.add.group([this.player, this.clock], { runChildUpdate: true });

    // collisions
    this.physics.add.collider(this.player, walls);

    // events
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.pause();
      this.scene.launch('Paused');
    });

    // setup
    this.cameras.main.startFollow(this.player);
  }

  update(): void {
    const isOverlapping = this.physics.overlap(
      this.interactiveObjects,
      this.player,
      this.player.setInteractiveObject,
      undefined,
      this.player
    );

    if (!isOverlapping) {
      this.player.setInteractiveObject(undefined);
    }
  }

  createBackgrounds() {
    this.add.sprite(0, 0, 'town').setOrigin(0);
    this.add.sprite(2300, 0, 'forest').setOrigin(0);
  }

  createWarpers(): Warp[] {
    const warpTop = new Warp(this, WarpType.STAIRS_TOP, this.player);
    const warpBottom = new Warp(this, WarpType.STAIRS_BOTTOM, this.player);
    const warpEast = new Warp(this, WarpType.TOWN_EAST, this.player);
    const warpForest = new Warp(this, WarpType.FOREST, this.player);

    return [warpTop, warpBottom, warpEast, warpForest];
  }

  createNpcs(): NPC[] {
    const inventor = new NPC(this, NPCType.Inventor, this.player);
    const stranger = new NPC(this, NPCType.Stranger, this.player);

    return [inventor, stranger];
  }

  createItems(): Item[] {
    const book = new Item(this, ItemType.Book, this.player);
    const ring = new Item(this, ItemType.Ring, this.player);

    return [book, ring];
  }
}
