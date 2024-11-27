import { GameObjects, Scene } from 'phaser';

import { Config } from '../../config';
import { HelperTextData } from '../../data/helperText';
import { Layer } from '../../data/layers';
import { HelperTextType, InteractResult, Interactive, LazyInitialize } from '../../data/types';
import { shouldInitialize } from '../../utils/util';
import { Player } from '../Player/Player';
import { Key } from '../UI/InputManager';

export class HelperText extends GameObjects.Image implements Interactive, LazyInitialize {
  player: Player;
  disabled: boolean = false;
  initialized: boolean = false;

  constructor(scene: Scene, type: HelperTextType, player: Player) {
    const { x, y } = HelperTextData[type];
    super(scene, x, y, '');
    this.name = `HelperText-${type}`;

    this.player = player;
  }

  lazyInit(forceInit?: boolean): void {
    if (!forceInit && (this.initialized || !shouldInitialize(this, this.player))) return;

    const { size } = HelperTextData[HelperTextType.LabStairs];

    this.setDepth(Layer.Items);
    this.setDisplaySize(size.x, size.y);
    if (!Config.debug) this.setAlpha(0);

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    if (Config.debug) this.setInteractive({ draggable: true });

    this.initialized = true;
  }

  getButtonPrompt?(): string | string[] | undefined {
    return HelperTextData[HelperTextType.LabStairs].text;
  }

  onInteract(_keys: Record<Key, boolean>): InteractResult {
    return InteractResult.None;
  }

  update() {
    this.lazyInit();
  }
}
