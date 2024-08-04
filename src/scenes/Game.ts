import { GameObjects, Scene } from 'phaser';

import { DebugLight } from '../classes/Debug/DebugLight';
import { DebugUI } from '../classes/Debug/DebugUI';
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
import { Config } from '../config';
import { backgroundData } from '../data/background';
import { lightData } from '../data/lights';
import { slopeData } from '../data/slope';
import { ItemType, NPCType, PropType, WarpType } from '../data/types';
import { Colors, getColorNumber } from '../utils/colors';
import { isDaytime, setDaytime, toggleLighting } from '../utils/lighting';
import { getCurrentSaveState, load, loadConfig, save } from '../utils/save';
import { fadeIn } from '../utils/util';

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

    // fade in on start
    fadeIn(this, 500);

    // background
    this.createBackgrounds();

    // game objects
    this.player = new Player(this);

    const walls = new Walls(this, this.player);
    const warpers = this.createWarpers();
    const npcs = this.createNpcs();
    const items = this.createItems();
    const slopes = this.createSlopes();
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
    const updateables = this.add.group([this.player, this.gamepad, forestFireflies, lakeFireflies, ...slopes], {
      runChildUpdate: true,
    });
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
    return backgroundData.map((b) => {
      const background = this.physics.add.image(b.x, b.y, b.image).setOrigin(0);
      if (!b.skipLighting) background.setPipeline('Light2D');
      if (b.scale) background.setScale(b.scale);
      if (Config.debug) background.setInteractive({ draggable: true });

      return background;
    });
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
    return Object.values(NPCType)
      .filter((value) => typeof value === 'number')
      .map((npc) => new NPC(this, npc as NPCType, this.player));
  }

  createItems(): Item[] {
    const gear = new Item(this, ItemType.Gear1, this.player);
    return [gear];
  }

  createSlopes(): Slope[] {
    return slopeData.map((s) => new Slope(this, s.x, s.y, s.width, s.height, s.flip, s.upwards));
  }

  createProps(): Prop[] {
    return Object.values(PropType)
      .filter((value) => typeof value === 'number')
      .map((prop) => new Prop(this, prop as PropType, this.player));
  }

  createUI() {
    this.time.delayedCall(300, () => {
      [
        new IconButton(this, 31, 30, 'settings', () => {
          this.scene.pause();
          this.scene.launch('Paused', { game: this });
        }),
        new IconButton(this, 81, 30, isDaytime(this) ? 'moon' : 'sun', (button) => {
          const prev = isDaytime(this);
          toggleLighting(this);
          button.img.setTexture(prev ? 'sun' : 'moon');
        }),
        new IconButton(this, 131, 30, Config.zoomed ? 'zoom-out' : 'zoom-in', () => {
          const savedata = getCurrentSaveState(this);
          save(this, { ...savedata, settings: { ...savedata.settings, zoomed: !Config.zoomed } });

          this.scene.restart();
        }),
      ].forEach((button) => {
        button.setAlpha(0);
        this.tweens.add({
          targets: button,

          alpha: 1,
          duration: 250,
        });
      });
    });

    this.gamepad = new Gamepad(this);

    // debug
    let debugUI;
    if (import.meta.env.DEV) {
      this.time.delayedCall(1000, () => {
        debugUI = new DebugUI(this, this.player);
        this.add.group(debugUI, { runChildUpdate: true });
      });
    }

    return { debugUI };
  }

  createLights(): void {
    this.lights.enable().setAmbientColor(getColorNumber(Colors.White));

    lightData.forEach((light) => {
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

    this.input.keyboard?.on('keydown-J', () => {
      this.player.journal.openJournal();
    });

    this.events.on('resume', () => {
      this.player.keys.resetKeys();
    });
  }
}
