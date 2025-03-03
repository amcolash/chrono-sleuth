import { GameObjects, Geom, Scene, Types } from 'phaser';

import { DebugLight } from '../classes/Debug/DebugLight';
import { DebugUI } from '../classes/Debug/DebugUI';
import { Background } from '../classes/Environment/Background';
import { Clock } from '../classes/Environment/Clock';
import { ClockHands } from '../classes/Environment/ClockHands';
import { Fireflies, FireflyPositions } from '../classes/Environment/Fireflies';
import { HelperText } from '../classes/Environment/HelperText';
import { Item } from '../classes/Environment/Item';
import { NPC } from '../classes/Environment/NPC';
import { ParallaxBackground } from '../classes/Environment/ParallaxBackground';
import { Prop } from '../classes/Environment/Prop';
import { Sign } from '../classes/Environment/Sign';
import { Slope } from '../classes/Environment/Slope';
import { Walls } from '../classes/Environment/Walls';
import { Warp } from '../classes/Environment/Warp';
import { Music } from '../classes/Music';
import { Player } from '../classes/Player/Player';
import { Gamepad } from '../classes/UI/Gamepad';
import { IconButton } from '../classes/UI/IconButton';
import { Notification } from '../classes/UI/Notification';
import { Config } from '../config';
import { helperTextList, npcList, propList, signList, warpList } from '../data/arrays';
import { BackgroundData } from '../data/background';
import { Layer } from '../data/layers';
import { LightData } from '../data/lights';
import { ParallaxBackgroundData } from '../data/parallaxBackground';
import { SlopeData } from '../data/slope';
import { Interactive, PostUpdated } from '../data/types';
import { Colors, getColorNumber } from '../utils/colors';
import { isNighttime, setDaytime } from '../utils/lighting';
import { load, loadConfig } from '../utils/save';
import { Panel, PanelType, globalStats } from '../utils/stats';
import { fadeIn, fadeOut, openDialog } from '../utils/util';

type LightData = {
  light: GameObjects.Light | DebugLight;
  random: number;
  intensity: number;
};

export class Game extends Scene {
  player: Player;
  interactiveObjects: GameObjects.Group;
  clock: Clock;
  gamepad: Gamepad;
  saveIcon: GameObjects.Image;

  lightData: LightData[] = [];

  // Special objects that need to have update hooks after standard update
  postUpdated: PostUpdated[] = [];

  cullingStats: PanelType;

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

    Music.setScene(this);

    const startTime = performance.now();

    // fade in on start
    fadeOut(this, 0);
    this.time.delayedCall(Config.bootDialog ? 0 : 250, () => fadeIn(this, Config.bootDialog ? 150 : 500));

    // game objects
    this.player = new Player(this);
    this.postUpdated.push(this.player);

    const backgrounds = this.createBackgrounds();
    const parallaxBackgrounds = this.createParallaxBackgrounds();

    // objects without side effects
    const walls = new Walls(this, this.player);
    const slopes = this.createSlopes();
    const helperTexts = this.createHelperText();
    const signs = this.createSigns();

    // objects with side effects
    const warpers = this.createWarpers();
    const npcs = this.createNpcs();
    const items = this.createItems();
    const props = this.createProps();

    const smallClockHands = new ClockHands(this, this.player, true);

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
    this.interactiveObjects = this.add.group([...warpers, ...npcs, ...items, ...props, ...helperTexts], {
      runChildUpdate: true,
    });

    // update items added to the group
    const updateables = this.add.group(
      [
        this.player,
        forestFireflies,
        lakeFireflies,
        smallClockHands,
        walls,
        ...slopes,
        ...signs,
        ...backgrounds,
        ...parallaxBackgrounds,
      ],
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

    if (!Config.prod) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      const message = `Game.create() took ${duration.toFixed(1)}ms to initialize`;

      if (Config.debug && duration > 300) new Notification(this, message, undefined, Colors.Warning);
      else if (!Config.debug && duration > 150) new Notification(this, message, undefined, Colors.Warning);

      if ((window as any).bootTime > -1) {
        console.log('Total game boot time', Date.now() - (window as any).bootTime);
        (window as any).bootTime = -1;
      }
    }
  }

  update(time: number): void {
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

    // Slight flicker for lights
    if (isNighttime(this)) {
      for (let light of this.lightData) {
        if (Math.random() > 0.98) {
          light.light.setIntensity(light.intensity * (0.9 + Math.random() * 0.1));
        }
      }
    }

    this.frustumCull();
  }

  // Reused rectangles for frustum culling
  cameraPadding = 150;
  cameraBounds: Geom.Rectangle = new Geom.Rectangle(
    0,
    0,
    Config.width + this.cameraPadding * 2,
    Config.height + this.cameraPadding * 2
  );
  objectBounds: Geom.Rectangle = new Geom.Rectangle(0, 0, 0, 0);

  frustumCull() {
    const start = performance.now();

    this.cameraBounds.x = this.cameras.main.scrollX - this.cameraPadding;
    this.cameraBounds.y = this.cameras.main.scrollY - this.cameraPadding;

    const children = this.children.getAll();

    // let visible = '';
    let count = 0;
    let total = 0;
    for (let child of children) {
      if (
        child instanceof GameObjects.Image ||
        child instanceof GameObjects.Sprite ||
        child instanceof GameObjects.Particles.ParticleEmitter ||
        child instanceof GameObjects.Graphics
      ) {
        if (
          child.depth !== Layer.Debug &&
          (child instanceof Slope ||
            (!(child instanceof Warp) && child.name?.startsWith('Warp')) ||
            child.depth >= Layer.Ui ||
            child.name?.length === 0)
        ) {
          continue;
        }

        total++;

        this.objectBounds.setTo(
          child.x,
          child.y,
          /* @ts-ignore */
          child.displayWidth || child.width || 1,
          /* @ts-ignore */
          child.displayHeight || child.height || 1
        );

        if (Geom.Intersects.RectangleToRectangle(this.cameraBounds, this.objectBounds)) {
          if (child instanceof Warp) child.updateLocked();
          else child.setVisible(true);
          count++;
        } else {
          child.setVisible(false);
        }
      }
    }

    if (globalStats && !this.cullingStats)
      this.cullingStats = globalStats.addPanel(Panel('Culling', '#9ad8e4', '#064b62'));
    this.cullingStats?.update(performance.now() - start);
  }

  createBackgrounds() {
    return BackgroundData.map((b) => new Background(this, b, this.player));
  }

  createParallaxBackgrounds() {
    return ParallaxBackgroundData.map((b) => new ParallaxBackground(this, b));
  }

  createWarpers(): Warp[] {
    return warpList.map((warp) => new Warp(this, warp, this.player));
  }

  createNpcs(): NPC[] {
    return npcList.map((npc) => new NPC(this, npc, this.player));
  }

  createItems(): Item[] {
    // Only some items are created on start
    return [].map((item) => new Item(this, item, this.player));
  }

  createSlopes(): Slope[] {
    return SlopeData.map((s) => new Slope(this, s.x, s.y, s.width, s.height, s.flip, s.upwards));
  }

  createProps(): Prop[] {
    return propList.map((prop) => new Prop(this, prop, this.player));
  }

  createHelperText() {
    return helperTextList.map((text) => new HelperText(this, text, this.player));
  }

  createSigns() {
    return signList.map((sign) => new Sign(this, sign, this.player));
  }

  createUI() {
    this.time.delayedCall(50, () => {
      let x = 30;
      new IconButton(this, x, 30, 'settings', () => {
        if (this.player.message.visible) return;

        this.scene.pause();
        this.scene.launch('Paused', { game: this });
      });

      if (!Config.prod) {
        // new IconButton(this, (x += 50), 30, isDaytime(this) ? 'moon' : 'sun', (button) => {
        //   const prev = isDaytime(this);
        //   toggleLighting(this);
        //   button.setIcon(prev ? 'sun' : 'moon');
        // });
        // new IconButton(this, (x += 50), 30, Config.zoomed ? 'zoom-out' : 'zoom-in', () => {
        //   const savedata = getCurrentSaveState(this);
        //   save(this, { ...savedata, settings: { ...savedata.settings, zoomed: !Config.zoomed } });

        //   this.scene.restart();
        // });

        new IconButton(this, (x += 50), 30, 'terminal', () => {
          openDialog(this, 'DebugTool');
        });
      }

      this.saveIcon = this.add
        .image(30, Config.height - 30, 'icons', 'save')
        .setScale(0.4)
        .setDepth(Layer.Ui)
        .setScrollFactor(0)
        .setAlpha(0);

      this.saveIcon.postFX.addGlow(0x000000, 2);
      // this.saveIcon.postFX.addGlow(0x000000, 1);
    });

    this.gamepad = new Gamepad(this);

    // debug
    if (!Config.prod) {
      this.time.delayedCall(500, () => {
        const debugUI = new DebugUI(this, this.player);
        this.add.group(debugUI, { runChildUpdate: true });
      });

      if (Config.bootDialog) {
        this.time.delayedCall(150, () => openDialog(this, Config.bootDialog!));
      }
    }
  }

  createLights(): void {
    this.lights.enable().setAmbientColor(getColorNumber(Colors.White));

    LightData.forEach((light) => {
      const intensity = light.intensity || 1;

      if (Config.debug) {
        this.lightData.push({
          light: new DebugLight(
            this,
            light.x,
            light.y,
            light.radius || 100,
            light.color || getColorNumber(Colors.Lights),
            intensity
          ),
          random: Math.random(),
          intensity,
        });
      } else {
        this.lightData.push({
          light: this.lights.addLight(
            light.x,
            light.y,
            light.radius || 100,
            light.color || getColorNumber(Colors.Lights),
            intensity
          ),
          random: Math.random(),
          intensity,
        });
      }
    });

    setDaytime(this, false);
  }

  createEventListeners() {
    this.input.keyboard?.on('keydown-ESC', () => {
      if (this.player.message.visible) return;

      this.scene.pause();
      this.scene.launch('Paused', { game: this });
    });

    this.events.on('resume', () => {
      this.player.keys.resetKeys();
    });

    this.events.on('postupdate', () => {
      this.postUpdated.forEach((obj) => obj.postUpdate());
    });
  }
}
