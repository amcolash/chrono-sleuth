import { Physics, Scene } from 'phaser';

import { Config } from '../../config';
import { PropDialogs, getDialog } from '../../data/dialog';
import { Layer } from '../../data/layers';
import { PropData } from '../../data/prop';
import { InteractResult, Interactive, LazyInitialize, PropType } from '../../data/types';
import { shouldInitialize } from '../../utils/util';
import { Player } from '../Player/Player';
import { Key } from '../UI/InputManager';

export class Prop extends Physics.Arcade.Image implements Interactive, LazyInitialize {
  propType: PropType;
  player: Player;
  initialized: boolean = false;

  constructor(scene: Scene, type: PropType, player: Player) {
    const { x, y, image } = PropData[type];
    super(scene, x, y, image);

    this.propType = type;
    this.player = player;
  }

  lazyInit(forceInit?: boolean) {
    if (!forceInit && (this.initialized || !shouldInitialize(this, this.player))) return;

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    if (Config.debug) this.setInteractive({ draggable: true });

    this.setScale(0.35).setDepth(Layer.Items).setPipeline('Light2D');

    this.initialized = true;
  }

  onInteract(keys: Record<Key, boolean>): InteractResult {
    if (this.player.message.visible || Date.now() < this.player.message.interactionTimeout) return InteractResult.None;

    if (keys[Key.Continue]) {
      const dialogs = PropDialogs[this.propType] || [];
      const dialog = getDialog<Prop>(dialogs, this.player);

      if (dialog) {
        this.player.message.setDialog<Prop>(dialog, undefined, PropData[this.propType].portrait || 'player_portrait');
        return InteractResult.Prop;
      }
    }

    return InteractResult.None;
  }

  getButtonPrompt() {
    return [`Inspect ${PropType[this.propType]}`, 'Press [CONTINUE]'];
  }

  update() {
    this.lazyInit();
  }
}
