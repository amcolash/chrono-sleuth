import { GameObjects, Input } from 'phaser';

import { Config } from '../../config';
import { Colors, fontStyle } from '../../utils/colors';
import { Player } from '../Player';

export class DebugUI extends GameObjects.Container {
  text: GameObjects.Text;
  player: Player;
  activeElement?: GameObjects.GameObject;
  outline: GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, 0, 0);

    if (!Config.debug) return;

    this.player = player;

    this.setScrollFactor(0).setDepth(2);
    this.scene.add.existing(this);

    this.text = scene.add.text(10, 60, '', {
      ...fontStyle,
      fontSize: 20,
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

    // NOTE: There is a bug with dragging static bodies. If we drag a wall, it will not move the body.
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
    } else {
      this.outline.setSize(0, 0);
    }
  }
}
