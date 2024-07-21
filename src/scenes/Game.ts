import { GameObjects, Scene } from 'phaser';

import { Clock } from '../classes/Clock';
import { DebugLight } from '../classes/DebugLight';
import { Fireflies } from '../classes/Fireflies';
import { Item } from '../classes/Item';
import { NPC } from '../classes/NPC';
import { Player } from '../classes/Player';
import { DebugUI } from '../classes/UI/DebugUI';
import { Gamepad } from '../classes/UI/Gamepad';
import { MenuButton } from '../classes/UI/MenuButton';
import { Walls } from '../classes/Walls';
import { Warp } from '../classes/Warp';
import { ItemType, NPCType, WarpType } from '../classes/types';
import { Config } from '../config';
import { Colors, getColorNumber } from '../utils/colors';
import { load } from '../utils/save';

export class Game extends Scene {
  player: Player;
  interactiveObjects: GameObjects.Group;
  clock: Clock;
  gamepad: Gamepad;

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

    const fireflies = new Fireflies(this, 3100, 600);

    // lights
    this.createLights();

    // ui
    new MenuButton(this);
    this.gamepad = new Gamepad(this);

    // rewindable objects
    const rewindable = [this.player];
    this.clock = new Clock(this, rewindable, this.player);

    // interactive objects
    this.interactiveObjects = this.add.group([...warpers, ...npcs, ...items], {
      runChildUpdate: true,
    });

    // update items added to the group
    const updatables = this.add.group([this.player, this.clock, this.gamepad, fireflies], {
      runChildUpdate: true,
    });

    // debug
    if (import.meta.env.DEV) {
      const debugUI = new DebugUI(this, this.player);
      updatables.add(debugUI);
    }

    // collisions
    this.physics.add.collider(this.player, walls);

    // events
    this.createEventListeners();

    // camera
    const camera = this.cameras.main;
    camera.startFollow(this.player, true);
    camera.setFollowOffset(0, Config.cameraOffset);

    // load save, or start new game
    load(this);
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
    backgrounds.forEach((background) => {
      background.setPipeline('Light2D');
      if (Config.debug) background.setInteractive({ draggable: true });
    });

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
    const mayor = new NPC(this, NPCType.Mayor, this.player);

    const clockTower = new NPC(this, NPCType.ClockTower, this.player);

    return [inventor, stranger, sphinx, mayor, clockTower];
  }

  createItems(): Item[] {
    const gear = new Item(this, ItemType.Gear1, this.player);
    return [gear];
  }

  createLights(): void {
    this.lights.enable().setAmbientColor(getColorNumber(Colors.Ambient));

    const lights: { x: number; y: number; radius?: number; color?: number; intensity?: number }[] = [
      // Town square
      { x: 135, y: 462, radius: 150, color: getColorNumber(Colors.Tan), intensity: 2.5 },
      { x: 697, y: 441 },
      { x: 1018, y: 435 },
      { x: 887, y: 200 },
      { x: 1561, y: 460 },
      { x: 791, y: 472, radius: 100, intensity: 0.5 },
      { x: 962, y: 469, radius: 100, intensity: 0.5 },

      // Underground
      { x: 162, y: 814, intensity: 2 },
      { x: 635, y: 772 },
      { x: 1638, y: 788, intensity: 2 },
    ];

    lights.forEach((light) => {
      if (Config.debug) {
        new DebugLight(
          this,
          light.x,
          light.y,
          light.radius || 100,
          light.color || getColorNumber(Colors.Lights),
          light.intensity || 1
        );
      } else {
        this.lights.addLight(
          light.x,
          light.y,
          light.radius || 100,
          light.color || getColorNumber(Colors.Lights),
          light.intensity || 1
        );
      }
    });
  }

  createEventListeners() {
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.pause();
      this.scene.launch('Paused', { game: this });
    });

    this.input.keyboard?.on('keydown-J', () => {
      this.player.journal.openJournal();
    });

    this.events.on('resume', () => {
      this.player.keys.resetKeys();
    });
  }
}
