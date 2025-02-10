import { GameObjects, Input, Math as PhaserMath, Physics } from 'phaser';

import { Config } from '../../config';
import { Layer } from '../../data/layers';
import { saveKey } from '../../data/saves';
import { Game } from '../../scenes/Game';
import { Colors, getColorNumber } from '../../utils/colors';
import { save } from '../../utils/save';
import { toggleXRay } from '../../utils/shaders/xray';
import { openDialog } from '../../utils/util';
import { DebugLight } from '../Debug/DebugLight';
import { Player } from '../Player/Player';

const alwaysShowInfo = false;

export class DebugUI extends GameObjects.Container {
  text: GameObjects.BitmapText;
  rect: GameObjects.Rectangle;
  player: Player;
  activeElement?: GameObjects.GameObject;
  outline: GameObjects.Rectangle;
  scene: Game;
  xray: boolean = false;
  dragOffset = new PhaserMath.Vector2();
  debugCamera: GameObjects.Rectangle;

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

    if (!Config.debug && !alwaysShowInfo) return;

    this.setScrollFactor(0).setDepth(Layer.Debug).setAlpha(0.8);
    this.scene.add.existing(this);

    this.rect = scene.add.rectangle(0, 0, 0, 0, getColorNumber(Colors.Black)).setOrigin(0).setDepth(Layer.Debug);
    this.add(this.rect);

    this.text = scene.add.bitmapText(20, 90, 'm6x11-24', '');
    this.add(this.text);

    this.outline = scene.add.rectangle(0, 0, 0, 0).setStrokeStyle(6, 0x00ff00).setDepth(Layer.Debug);
    this.debugCamera = scene.add
      .rectangle(0, 0, Config.width, Config.height)
      .setStrokeStyle(4, 0xdd8800)
      .setDepth(Layer.Debug);
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
      localStorage.removeItem(saveKey);
      this.scene.scene.restart();
    });

    this.scene.input.keyboard?.on('keydown-N', () => {
      localStorage.removeItem(saveKey);
      this.scene.scene.start('Preloader');
    });

    this.scene.input.keyboard?.on('keydown-Z', () => {
      Config.debug = !Config.debug;
      save(this.scene);
      this.scene.scene.restart();
    });

    this.scene.input.keyboard?.on('keydown-FORWARD_SLASH', () => {
      this.scene.player.gameState.updateData({ night: !this.scene.player.gameState.data.night });
    });

    this.scene.input.keyboard?.on('keydown-CLOSED_BRACKET', () => {
      openDialog(this.scene, 'DebugTool');
    });

    this.scene.input.keyboard?.on('keydown-QUOTES', () => {
      toggleXRay(this.scene, !this.xray);
      this.xray = !this.xray;
    });

    this.scene.input.keyboard?.on('keydown-PLUS', () => {
      if (this.scene.scale.isFullscreen) {
        this.scene.scale.stopFullscreen();
      } else {
        this.scene.scale.startFullscreen();
      }
    });

    this.scene.input.keyboard?.on('keydown-V', () => {
      this.player.message.setDialog({
        messages: ['<b><i>[CREAK]</i></b> A <color=red>red</color> test [CREAK]'],
      });
    });

    if (Config.debug) {
      // Keys
      this.scene.input.keyboard?.on('keydown-COMMA', () => {
        const lights = this.scene.lights.lights;
        console.table(lights, ['x', 'y']);
      });

      this.scene.input.keyboard?.on('keydown-PERIOD', () => {
        const pointer = this.scene.input.activePointer;
        new DebugLight(this.scene, pointer.worldX, pointer.worldY, 100, getColorNumber(Colors.Lights), 1);
      });

      // Dragging
      this.scene.input.on('gameobjectdown', (pointer: Input.Pointer, gameObject: GameObjects.GameObject) => {
        if (pointer.buttons !== 1) return;

        if (gameObject instanceof Player) return;

        if (gameObject && gameObject !== this.activeElement) {
          this.activeElement = gameObject;
          // @ts-ignore
          this.dragOffset.set(gameObject.x - pointer.worldX, gameObject.y - pointer.worldY);
        } else {
          this.activeElement = undefined;
          this.dragOffset.set(0, 0);
        }
      });

      this.scene.input.on('drag', (pointer: Input.Pointer, gameObject: GameObjects.GameObject) => {
        if (this.activeElement === gameObject) {
          // @ts-ignore
          gameObject.setPosition(this.dragOffset.x + pointer.worldX, this.dragOffset.y + pointer.worldY);
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
    if (!Config.debug && !alwaysShowInfo) return;
    const pointer = this.scene.input.activePointer;

    const lines = [
      `FPS (now): ${(1000 / this.scene.game.loop.delta).toFixed(1)}`,
      `FPS (avg): ${this.scene.game.loop.actualFps.toFixed(1)}`,
      `Frame Time: ${this.scene.game.loop.delta.toFixed(2)}`,
      `Camera: ${this.scene.cameras.main.scrollX.toFixed(1)}, ${this.scene.cameras.main.scrollY.toFixed(1)}`,
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
    this.rect
      .setPosition(this.text.x - 10, this.text.y - 10)
      .setSize(this.text.displayWidth + 20, this.text.displayHeight + 20);

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

    this.debugCamera.setPosition(
      Config.width / 2 + this.scene.cameras.main.scrollX,
      Config.height / 2 + this.scene.cameras.main.scrollY
    );
  }
}
