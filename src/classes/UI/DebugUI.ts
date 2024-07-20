import { GameObjects, Input, Physics } from 'phaser';

import { Config } from '../../config';
import { Colors } from '../../utils/colors';
import { fontStyle } from '../../utils/fonts';
import { Player } from '../Player';

export class DebugUI extends GameObjects.Container {
  text: GameObjects.Text;
  player: Player;
  activeElement?: GameObjects.GameObject;
  outline: GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, 0, 0);

    scene.physics.world.drawDebug = Config.debug;

    // Update the debug graphics
    if (Config.debug) {
      scene.physics.world.createDebugGraphic();
    } else {
      scene.physics.world.debugGraphic?.clear();
    }

    if (!Config.debug) return;

    this.player = player;

    this.setScrollFactor(0).setDepth(2);
    this.scene.add.existing(this);

    this.text = scene.add.text(20, 90, '', {
      ...fontStyle,
      fontSize: 32,
      backgroundColor: `#${Colors.Black}`,
      padding: { x: 5, y: 5 },
    });
    this.add(this.text);

    this.outline = scene.add.rectangle(0, 0, 0, 0).setStrokeStyle(2, 0x00ff00).setScale(1.1).setDepth(3);

    scene.input.on('gameobjectdown', (_pointer: Input.Pointer, gameObject: GameObjects.GameObject) => {
      if (gameObject !== this.activeElement) {
        this.activeElement = gameObject;
      } else {
        this.activeElement = undefined;
      }
    });

    scene.input.on('drag', (pointer: Input.Pointer, gameObject: GameObjects.GameObject) => {
      if (this.activeElement === gameObject) {
        gameObject.setPosition(pointer.worldX, pointer.worldY);
      }
    });
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
