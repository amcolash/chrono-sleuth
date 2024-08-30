import { GameObjects, Math as PhaserMath, Scene, Types } from 'phaser';

import { Colors, getColorNumber } from '../../utils/colors';
import { InputManager, Key } from './InputManager';

export interface CursorData {
  regions: Types.Math.Vector2Like[][];
  size: number;
  keyHandler: (position: PhaserMath.Vector2) => void;
}

export class Cursor extends GameObjects.Rectangle {
  keys: InputManager;
  cursorData: CursorData;
  nextUpdate: number = 0;
  position: PhaserMath.Vector2 = new PhaserMath.Vector2(-1, -1);

  constructor(scene: Scene, cursorData: CursorData, keys: InputManager) {
    super(scene, 0, 0, cursorData.size, cursorData.size);
    scene.add.group(this, { runChildUpdate: true });

    this.setStrokeStyle(2, getColorNumber(Colors.Tan), 0.75);
    this.setVisible(false);

    this.cursorData = cursorData;
    this.keys = keys;

    scene.input.on('pointerdown', (_pointer: Phaser.Input.Pointer) => {
      this.setVisible(false);
    });
  }

  update(time: number, _delta: number): void {
    if (time < this.nextUpdate) return;
    let moved = true;

    const width = this.cursorData.regions[0].length;
    const height = this.cursorData.regions.length;

    const keys = this.keys.keys;
    if (keys[Key.Continue]) this.cursorData.keyHandler(this.position);
    else if (keys[Key.Left]) this.position.x--;
    else if (keys[Key.Right]) this.position.x++;
    else if (keys[Key.Up]) this.position.y--;
    else if (keys[Key.Down]) this.position.y++;
    else moved = false;

    if (moved) {
      this.position.x = PhaserMath.Clamp(this.position.x, 0, width - 1);
      this.position.y = PhaserMath.Clamp(this.position.y, 0, height - 1);

      this.nextUpdate = time + 170;
      this.setVisible(true);
      this.setPosition(
        this.cursorData.regions[this.position.y][this.position.x].x,
        this.cursorData.regions[this.position.y][this.position.x].y
      );
    }
    // }
  }
}
