import { GameObjects, Input, Physics } from 'phaser';

import { Config } from '../../config';
import { Layer } from '../../data/layers';
import { SaveType, saves } from '../../data/saves';
import { Game } from '../../scenes/Game';
import { Colors, getColorNumber } from '../../utils/colors';
import { fontStyle } from '../../utils/fonts';
import { toggleLighting } from '../../utils/lighting';
import { getCurrentSaveState, save } from '../../utils/save';
import { openDialog } from '../../utils/util';
import { DebugLight } from '../Debug/DebugLight';
import { Player } from '../Player/Player';

export class DebugUI extends GameObjects.Container {
  text: GameObjects.Text;
  player: Player;
  activeElement?: GameObjects.GameObject;
  outline: GameObjects.Rectangle;
  scene: Game;
  dayNight: boolean = false;

  constructor(scene: Game, player: Player) {
    super(scene, 0, 0);
    this.scene = scene;
    this.player = player;

    scene.physics.world.drawDebug = Config.debug;

    // Update the debug graphics
    if (Config.debug) {
      scene.physics.world.createDebugGraphic();
    } else {
      scene.physics.world.debugGraphic?.clear();
    }

    this.createEventListeners();

    if (!Config.debug) return;

    this.setScrollFactor(0).setDepth(Layer.Debug).setAlpha(0.8);
    this.scene.add.existing(this);

    this.text = scene.add.text(20, 90, '', {
      ...fontStyle,
      fontSize: Config.zoomed ? 24 : 32,
      backgroundColor: `#${Colors.Black}`,
      padding: { x: 5, y: 5 },
    });
    this.add(this.text);

    this.outline = scene.add.rectangle(0, 0, 0, 0).setStrokeStyle(2, 0x00ff00).setScale(1.1).setDepth(Layer.Debug);
  }

  createEventListeners() {
    // Keys
    this.scene.input.keyboard?.on('keydown-K', () => {
      save(this.scene);
    });

    this.scene.input.keyboard?.on('keydown-L', () => {
      this.scene.scene.restart();
    });

    this.scene.input.keyboard?.on('keydown-M', () => {
      save(this.scene, saves[SaveType.Act2]);
      this.scene.scene.restart();
    });

    this.scene.input.keyboard?.on('keydown-N', () => {
      save(this.scene, saves[SaveType.New]);
      this.scene.scene.restart();
    });

    this.scene.input.keyboard?.on('keydown-Z', () => {
      Config.debug = !Config.debug;
      save(this.scene);
      this.scene.scene.restart();
    });

    this.scene.input.keyboard?.on('keydown-X', () => {
      const savedata = getCurrentSaveState(this.scene);
      save(this.scene, { ...savedata, settings: { ...savedata.settings, zoomed: !Config.zoomed } });

      this.scene.scene.restart();
    });

    this.scene.input.keyboard?.on('keydown-COMMA', () => {
      const lights = this.scene.lights.lights;
      console.table(lights, ['x', 'y']);
    });

    this.scene.input.keyboard?.on('keydown-FORWARD_SLASH', () => {
      toggleLighting(this.scene);
    });

    this.scene.input.keyboard?.on('keydown-O', () => {
      openDialog(this.scene, 'MazeDialog');
    });

    this.scene.input.keyboard?.on('keydown-P', () => {
      openDialog(this.scene, 'PipesDialog');
    });

    this.scene.input.keyboard?.on('keydown-CLOSED_BRACKET', () => {
      openDialog(this.scene, 'DebugTool');
    });

    if (Config.debug) {
      // Keys
      this.scene.input.keyboard?.on('keydown-PERIOD', () => {
        const pointer = this.scene.input.activePointer;
        new DebugLight(this.scene, pointer.worldX, pointer.worldY, 100, getColorNumber(Colors.Lights), 1);
      });

      // Dragging
      this.scene.input.on('gameobjectdown', (pointer: Input.Pointer, gameObject: GameObjects.GameObject) => {
        if (pointer.buttons !== 1) return;

        if (gameObject !== this.activeElement) {
          this.activeElement = gameObject;
        } else {
          this.activeElement = undefined;
        }
      });

      this.scene.input.on('drag', (pointer: Input.Pointer, gameObject: GameObjects.GameObject) => {
        if (this.activeElement === gameObject) {
          // @ts-ignore
          gameObject.setPosition(pointer.worldX, pointer.worldY);
        }
      });

      // Scrolling
      this.scene.input.on(
        'wheel',
        (
          _pointer: Input.Pointer,
          _currentlyOver: GameObjects.GameObject[],
          _deltaX: number,
          deltaY: number,
          _deltaZ: number
        ) => {
          this.scene.cameras.main.zoom = Math.max(0.01, this.scene.cameras.main.zoom + deltaY * 0.0005);
        }
      );

      this.scene.input.on('pointerup', (pointer: Input.Pointer) => {
        if (pointer.button === 1) {
          this.scene.cameras.main.zoom = 1;
        }
      });
    }
  }

  update() {
    if (!Config.debug) return;
    const pointer = this.scene.input.activePointer;

    const lines = [
      `FPS: ${this.scene.game.loop.actualFps.toFixed(1)}`,
      `Frame Time: ${this.scene.game.loop.delta.toFixed(2)}`,
      `Zoom: ${this.scene.cameras.main.zoom.toFixed(2)}`,
      '',
      `Player x: ${this.player.x.toFixed(1)}`,
      `Player y: ${this.player.y.toFixed(1)}`,
      '',
      `Mouse x: ${pointer.worldX.toFixed(1)}`,
      `Mouse y: ${pointer.worldY.toFixed(1)}`,
    ];

    if (this.activeElement) {
      lines.push('');
      // @ts-ignore
      lines.push(`Active x: ${this.activeElement.x.toFixed(1)}`);
      // @ts-ignore
      lines.push(`Active y: ${this.activeElement.y.toFixed(1)}`);
    }

    this.text.setText(lines);

    if (this.activeElement) {
      // @ts-ignore
      this.outline.setPosition(this.activeElement.x, this.activeElement.y);
      // @ts-ignore
      this.outline.setSize(this.activeElement.displayWidth, this.activeElement.displayHeight);
      // @ts-ignore
      this.outline.setOrigin(this.activeElement.originX, this.activeElement.originY);

      const body = this.activeElement.body;
      if ((body && body instanceof Physics.Arcade.Body) || body instanceof Physics.Arcade.StaticBody) {
        (body as Physics.Arcade.Body).updateFromGameObject();
      }
    } else {
      this.outline.setSize(0, 0);
    }
  }
}
