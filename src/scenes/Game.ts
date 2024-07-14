import { GameObjects, Input, Scene } from 'phaser';

import { Clock } from '../classes/Clock';
import { Item } from '../classes/Item';
import { NPC } from '../classes/NPC';
import { Player } from '../classes/Player';
import { DebugUI } from '../classes/UI/DebugUI';
import { Walls } from '../classes/Walls';
import { Warp } from '../classes/Warp';
import { NPCType, WarpType } from '../classes/types';
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
    this.player = new Player(this);

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
      (object, _player) => {
        if ((object as any).visible !== undefined) {
          return (object as any).visible;
        }

        return true;
      },
      this.player
    );

    if (!isOverlapping) {
      this.player.setInteractiveObject(undefined);
    }
  }

  createBackgrounds() {
    const town = this.physics.add.sprite(0, 0, 'town').setOrigin(0);

    const clock_outside = this.physics.add.sprite(500, -1100, 'clock_outside').setOrigin(0);
    const clock_inside = this.physics.add.sprite(500, -2400, 'clock_inner').setOrigin(0);

    const forest = this.physics.add.sprite(2300, 0, 'forest').setOrigin(0);
    const lake = this.physics.add.sprite(4400, 100, 'lake').setOrigin(0);

    const backgrounds = [town, clock_outside, clock_inside, forest, lake];
    if (Config.debug) {
      backgrounds.forEach((background) => background.setInteractive({ draggable: true }));
    }

    return backgrounds;
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
    const sphinx = new NPC(this, NPCType.Sphinx, this.player);

    const clockTower = new NPC(this, NPCType.ClockTower, this.player);

    return [inventor, stranger, sphinx, clockTower];
  }

  createItems(): Item[] {
    return [];
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
