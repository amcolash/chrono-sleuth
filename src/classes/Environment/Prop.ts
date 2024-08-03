import { Physics, Scene } from 'phaser';

import { Config } from '../../config';
import { getDialog, propDialogs } from '../../data/dialog';
import { Layer } from '../../data/layers';
import { propData } from '../../data/prop';
import { InteractResult, Interactive, PropType } from '../../data/types';
import { Player } from '../Player/Player';
import { Key } from '../UI/InputManager';

export class Prop extends Physics.Arcade.Image implements Interactive {
  propType: PropType;
  player: Player;

  constructor(scene: Scene, type: PropType, player: Player) {
    const { x, y, image } = propData[type];

    super(scene, x, y, image);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    if (Config.debug) this.setInteractive({ draggable: true });

    this.setScale(0.35).setDepth(Layer.Items).setPipeline('Light2D');

    this.propType = type;
    this.player = player;
  }

  onInteract(keys: Record<Key, boolean>): InteractResult {
    if (this.player.message.visible || Date.now() < this.player.message.interactionTimeout) return InteractResult.None;

    if (keys[Key.Continue]) {
      const dialogs = propDialogs[this.propType] || [];
      const dialog = getDialog(dialogs, this.player);

      if (dialog) {
        this.player.message.setDialog(dialog, undefined, propData[this.propType].portrait || 'player_portrait');
        return InteractResult.Prop;
      }
    }

    return InteractResult.None;
  }

  getButtonPrompt() {
    return [`Inspect ${PropType[this.propType]}`, 'Press [CONTINUE]'];
  }
}
