import { GameObjects, Scene, Types } from 'phaser';

import { DebugLight } from '../classes/Debug/DebugLight';
import { DebugUI } from '../classes/Debug/DebugUI';
import { Background } from '../classes/Environment/Background';
import { Clock } from '../classes/Environment/Clock';
import { Fireflies, FireflyPositions } from '../classes/Environment/Fireflies';
import { Item } from '../classes/Environment/Item';
import { NPC } from '../classes/Environment/NPC';
import { Prop } from '../classes/Environment/Prop';
import { Slope } from '../classes/Environment/Slope';
import { Walls } from '../classes/Environment/Walls';
import { Warp } from '../classes/Environment/Warp';
import { Player } from '../classes/Player/Player';
import { Gamepad } from '../classes/UI/Gamepad';
import { IconButton } from '../classes/UI/IconButton';
import { Notification } from '../classes/UI/Notification';
import { Config } from '../config';
import { npcList, propList, warpList } from '../data/arrays';
import { BackgroundData } from '../data/background';
import { LightData } from '../data/lights';
import { SlopeData } from '../data/slope';
import { Interactive, ItemType } from '../data/types';
import { Colors, getColorNumber } from '../utils/colors';
import { isDaytime, setDaytime, toggleLighting } from '../utils/lighting';
import { getCurrentSaveState, load, loadConfig, save } from '../utils/save';
import { fadeIn, openDialog } from '../utils/util';

export class Game extends Scene {
  player: Player;
  interactiveObjects: GameObjects.Group;
  clock: Clock;
  gamepad: Gamepad;

  shouldInit: boolean = true;

  constructor() {
    super('Game');
  }

  init() {
    // Check if config loaded needs to restart scene. If so, this makes the scene do nothing until it restarts
    const reloaded = loadConfig(this);
    this.shouldInit = !reloaded;
  }

  create() {
    // skip creation if already restarting the scene (due to config changes)
    if (!this.shouldInit) return;

    const startTime = performance.now();

    // fade in on start
    fadeIn(this, 500);

    // game objects
    this.player = new Player(this);

    const backgrounds = this.createBackgrounds();

    // objects without side effects
    const walls = new Walls(this, this.player);
    const warpers = this.createWarpers();
    const slopes = this.createSlopes();

    // objects with side effects
    const npcs = this.createNpcs();
    const items = this.createItems();
    const props = this.createProps();

    const forestFireflies = new Fireflies(this, FireflyPositions.Forest[0], FireflyPositions.Forest[1]);
    const lakeFireflies = new Fireflies(this, FireflyPositions.Lake[0], FireflyPositions.Lake[1]);

    // lights
    this.createLights();

    // ui
    this.createUI();

    // rewindable objects
    const rewindable = [this.player];
    if (Config.rewindEnabled) {
      this.clock = new Clock(this, rewindable, this.player);
    }

    // interactive objects
    this.interactiveObjects = this.add.group([...warpers, ...npcs, ...items, ...props], {
      runChildUpdate: true,
    });

    // update items added to the group
    const updateables = this.add.group(
      [this.player, this.gamepad, forestFireflies, lakeFireflies, ...slopes, walls, ...backgrounds],
      {
        runChildUpdate: true,
      }
    );
    if (this.clock) updateables.add(this.clock);

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

    const endTime = performance.now();
    const duration = endTime - startTime;
    const message = `Game.create() took ${duration.toFixed(1)}ms to initialize`;

    if (!Config.prod) {
      if (Config.debug && duration > 300) new Notification(this, message, undefined, Colors.Warning);
      else if (!Config.debug && duration > 150) new Notification(this, message, undefined, Colors.Warning);
      else new Notification(this, message);
    }
  }

  update(): void {
    if (this.player) {
      const isOverlapping = this.physics.overlap(
        this.interactiveObjects,
        this.player,
        this.player.setInteractiveObject,
        (object, _player) => {
          const o = object as any as Types.Physics.Arcade.ImageWithDynamicBody & Interactive;
          let interactive = true;

          if (o.disabled) interactive = false;
          if (o.visible !== undefined) interactive = interactive && o.visible;

          return interactive;
        },
        this.player
      );

      if (!isOverlapping) {
        this.player.setInteractiveObject(undefined);
      }
    }
  }

  createBackgrounds() {
    return BackgroundData.map((b) => new Background(this, b, this.player));
  }

  createWarpers(): Warp[] {
    return warpList.map((warp) => new Warp(this, warp, this.player));
  }

  createNpcs(): NPC[] {
    return npcList.map((npc) => new NPC(this, npc, this.player));
  }

  createItems(): Item[] {
    return [ItemType.Key].map((item) => new Item(this, item, this.player));
  }

  createSlopes(): Slope[] {
    return SlopeData.map((s) => new Slope(this, s.x, s.y, s.width, s.height, s.flip, s.upwards));
  }

  createProps(): Prop[] {
    return propList.map((prop) => new Prop(this, prop, this.player));
  }

  createUI() {
    this.time.delayedCall(50, () => {
      new IconButton(this, 31, 30, 'settings', () => {
        this.scene.pause();
        this.scene.launch('Paused', { game: this });
      });
      new IconButton(this, 81, 30, isDaytime(this) ? 'moon' : 'sun', (button) => {
        const prev = isDaytime(this);
        toggleLighting(this);
        button.img.setTexture(prev ? 'sun' : 'moon');
      });
      new IconButton(this, 131, 30, Config.zoomed ? 'zoom-out' : 'zoom-in', () => {
        const savedata = getCurrentSaveState(this);
        save(this, { ...savedata, settings: { ...savedata.settings, zoomed: !Config.zoomed } });

        this.scene.restart();
      });

      if (!Config.prod) {
        new IconButton(this, 181, 30, 'terminal', () => {
          openDialog(this, 'DebugTool');
        });
      }
    });

    this.gamepad = new Gamepad(this);

    // debug
    if (!Config.prod) {
      this.time.delayedCall(500, () => {
        const debugUI = new DebugUI(this, this.player);
        this.add.group(debugUI, { runChildUpdate: true });
      });

      if (Config.bootDialog) {
        this.time.delayedCall(100, () => openDialog(this, Config.bootDialog));
      }
    }
  }

  createLights(): void {
    this.lights.enable().setAmbientColor(getColorNumber(Colors.White));

    LightData.forEach((light) => {
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

    setDaytime(this, false);
  }

  createEventListeners() {
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.pause();
      this.scene.launch('Paused', { game: this });
    });

    this.events.on('resume', () => {
      this.player.keys.resetKeys();
    });
  }
}
