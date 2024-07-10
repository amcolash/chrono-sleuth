import { GameObjects, Input, Physics, Scene } from 'phaser';

import { Clock } from '../classes/Clock';
import { Item } from '../classes/Item';
import { NPC } from '../classes/NPC';
import { Player } from '../classes/Player';
import { DebugUI } from '../classes/UI/DebugUI';
import { Walls } from '../classes/Walls';
import { Warp } from '../classes/Warp';
import { ItemType, NPCType, WarpType } from '../classes/types';
import { Config } from '../config';

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

    const debugUI = new DebugUI(this, this.player);

    // rewindable objects
    const rewindable = [this.player];
    this.clock = new Clock(this, rewindable, this.player);

    // interactive objects
    this.interactiveObjects = this.add.group([...warpers, ...npcs, ...items], {
      runChildUpdate: true,
    });

    // update items added to the group
    this.add.group([this.player, this.clock, debugUI], {
      runChildUpdate: true,
    });

    // collisions
    this.physics.add.collider(this.player, walls);

    // events
    this.createEventListeners();

    // setup
    this.cameras.main.startFollow(this.player, true);
    this.cameras.main.setFollowOffset(0, Config.cameraOffset);
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
    const town = this.physics.add.sprite(0, 0, 'town').setOrigin(0);
    const forest = this.physics.add.sprite(2300, 0, 'forest').setOrigin(0);
    const clock_outside = this.physics.add.sprite(500, -1100, 'clock_outside').setOrigin(0);

    if (Config.debug) {
      town.setInteractive({ draggable: true });
      forest.setInteractive({ draggable: true });
      clock_outside.setInteractive({ draggable: true });
    }

    return [town, forest, clock_outside];
  }

  createWarpers(): Warp[] {
    const warpers: Warp[] = [];
    for (const warp in WarpType) {
      if (isNaN(Number(warp))) {
        warpers.push(new Warp(this, WarpType[warp as keyof typeof WarpType], this.player));
      }
    }

    return warpers;
  }

  createNpcs(): NPC[] {
    const inventor = new NPC(this, NPCType.Inventor, this.player);
    const stranger = new NPC(this, NPCType.Stranger, this.player);

    return [inventor, stranger];
  }

  createItems(): Item[] {
    const book = new Item(this, ItemType.Book, this.player);
    const ring = new Item(this, ItemType.Map, this.player);

    return [book, ring];
  }

  createEventListeners() {
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.pause();
      this.scene.launch('Paused');
    });

    this.input.keyboard?.on('keydown-J', () => {
      this.player.journal.openJournal();
    });

    if (Config.debug) {
      this.input.on(
        'wheel',
        (
          _pointer: Input.Pointer,
          _currentlyOver: GameObjects.GameObject[],
          _deltaX: number,
          deltaY: number,
          _deltaZ: number
        ) => {
          this.cameras.main.zoom += deltaY * 0.0005;
        }
      );
    }
  }
}
