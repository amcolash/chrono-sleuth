import { GameObjects, Math as PhaserMath, Scene, Types } from 'phaser';

import { Layer } from '../../data/layers';
import { Colors, getColorNumber } from '../../utils/colors';
import { InputManager, Key } from './InputManager';

export type Region = Types.Math.RectangleLike & { object?: GameObjects.GameObject };

export interface CursorData {
  regions: Region[][];
  onSelect: (position: PhaserMath.Vector2, region?: Region) => void;
  onChange?: (position: PhaserMath.Vector2, region?: Region) => void;
  hidden?: boolean;
}

export class Cursor extends GameObjects.Rectangle {
  keys: InputManager;
  cursorData: CursorData;
  nextUpdate: number = 0;
  position: PhaserMath.Vector2 = new PhaserMath.Vector2(-1, -1);

  constructor(scene: Scene, cursorData: CursorData, keys: InputManager) {
    super(scene, 0, 0);
    scene.add.group(this, { runChildUpdate: true });

    this.setStrokeStyle(3, getColorNumber(Colors.Tan), 0.75);
    this.setVisible(false).setDepth(Layer.Shader);

    this.cursorData = cursorData;
    this.keys = keys;

    scene.input.on('pointerdown', (_pointer: Phaser.Input.Pointer) => {
      this.setVisible(false);
    });
  }

  update(time: number, _delta: number): void {
    if (time < this.nextUpdate) return;
    let moved = true;

    let initialRegion;
    if (this.cursorData.regions[this.position.y])
      initialRegion = this.cursorData.regions[this.position.y][this.position.x];

    const keys = this.keys.keys;
    if (keys[Key.Continue]) this.cursorData.onSelect(this.position, initialRegion);
    else if (keys[Key.Left]) this.position.x--;
    else if (keys[Key.Right]) this.position.x++;
    else if (keys[Key.Up]) this.position.y--;
    else if (keys[Key.Down]) this.position.y++;
    else moved = false;

    if (moved) {
      const width = this.cursorData.regions[0]?.length;
      const height = this.cursorData.regions.length;

      this.position.x = PhaserMath.Clamp(this.position.x, 0, width - 1);
      this.position.y = PhaserMath.Clamp(this.position.y, 0, height - 1);

      const region = this.cursorData.regions[this.position.y][this.position.x];
      if (!this.cursorData.hidden) this.setVisible(true);
      this.setPosition(region.x, region.y);
      this.setDisplaySize(region.width, region.height);

      if (this.cursorData.onChange) this.cursorData.onChange(this.position, region);

      this.nextUpdate = time + 200;
    }
  }
}
