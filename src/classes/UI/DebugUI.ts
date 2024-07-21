import { GameObjects, Input, Physics } from 'phaser';

import { Config } from '../../config';
import { Game } from '../../scenes/Game';
import { Colors, getColorNumber } from '../../utils/colors';
import { fontStyle } from '../../utils/fonts';
import { Layer } from '../../utils/layers';
import { debugSave, defaultSave, save } from '../../utils/save';
import { DebugLight } from '../Light';
import { Player } from '../Player';

export class DebugUI extends GameObjects.Container {
  text: GameObjects.Text;
  player: Player;
  activeElement?: GameObjects.GameObject;
  outline: GameObjects.Rectangle;
  scene: Game;

  constructor(scene: Game, player: Player) {
    super(scene, 0, 0);
    this.scene = scene;

    scene.physics.world.drawDebug = Config.debug;

    // Update the debug graphics
    if (Config.debug) {
      scene.physics.world.createDebugGraphic();
    } else {
      scene.physics.world.debugGraphic?.clear();
    }

    this.createEventListeners();

    if (!Config.debug) return;

    this.player = player;

    this.setScrollFactor(0).setDepth(Layer.Debug);
    this.scene.add.existing(this);

    this.text = scene.add.text(20, 90, '', {
      ...fontStyle,
      fontSize: 32,
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
      save(this.scene, debugSave);
      this.scene.scene.restart(); // Just in case
    });

    this.scene.input.keyboard?.on('keydown-N', () => {
      save(this.scene, defaultSave);
      this.scene.scene.restart(); // Just in case
    });

    this.scene.input.keyboard?.on('keydown-Z', () => {
      Config.debug = !Config.debug;
      save(this.scene);
      this.scene.scene.restart();
    });

    this.scene.input.keyboard?.on('keydown-COMMA', () => {
      const lights = this.scene.lights.lights;
      console.table(lights, ['x', 'y']);
    });

    if (Config.debug) {
      // Keys
      this.scene.input.keyboard?.on('keydown-PERIOD', () => {
        const pointer = this.scene.input.activePointer;
        new DebugLight(this.scene, pointer.worldX, pointer.worldY, 100, getColorNumber(Colors.Lights), 1);
      });

      // Dragging
      this.scene.input.on('gameobjectdown', (_pointer: Input.Pointer, gameObject: GameObjects.GameObject) => {
        if (gameObject !== this.activeElement) {
          this.activeElement = gameObject;
        } else {
          this.activeElement = undefined;
        }
      });

      this.scene.input.on('drag', (pointer: Input.Pointer, gameObject: GameObjects.GameObject) => {
        if (this.activeElement === gameObject) {
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
          this.scene.cameras.main.zoom += deltaY * 0.0005;
        }
      );
    }
  }

  update() {
    if (!Config.debug) return;
    const pointer = this.scene.input.activePointer;

    const lines = [
      `Player x: ${this.player.x.toFixed(1)}`,
      `Player y: ${this.player.y.toFixed(1)}`,
      `Mouse x: ${pointer.worldX.toFixed(1)}`,
      `Mouse y: ${pointer.worldY.toFixed(1)}`,
    ];

    if (this.activeElement) {
      lines.push('');
      lines.push(`Active x: ${this.activeElement.x.toFixed(1)}`);
      lines.push(`Active y: ${this.activeElement.y.toFixed(1)}`);
    }

    this.text.setText(lines);

    if (this.activeElement) {
      this.outline.setPosition(this.activeElement.x, this.activeElement.y);
      this.outline.setSize(this.activeElement.displayWidth, this.activeElement.displayHeight);
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
