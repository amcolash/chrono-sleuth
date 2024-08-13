import { GameObjects, Physics, Scene } from 'phaser';

import { Config } from '../../config';
import { PropDialogs, getDialog } from '../../data/dialog';
import { Layer } from '../../data/layers';
import { PropData } from '../../data/prop';
import { InteractResult, Interactive, JournalEntry, LazyInitialize, PropType } from '../../data/types';
import { hasJournalEntry, initializeObject } from '../../utils/interactionUtils';
import { shouldInitialize } from '../../utils/util';
import { Player } from '../Player/Player';
import { Key } from '../UI/InputManager';

export class Prop extends Physics.Arcade.Image implements Interactive, LazyInitialize {
  propType: PropType;
  player: Player;
  initialized: boolean = false;
  particles: GameObjects.Particles.ParticleEmitter;

  constructor(scene: Scene, type: PropType, player: Player) {
    const { x, y, image } = PropData[type];
    super(scene, x, y, image || '');

    this.propType = type;
    this.player = player;

    this.setScale(!image ? 2 : 0.35).setDepth(Layer.Items);
    if (!image && !Config.debug) this.setAlpha(0);

    initializeObject(this, PropData[type]);
  }

  lazyInit(forceInit?: boolean) {
    if (!forceInit && (this.initialized || !shouldInitialize(this, this.player))) return;

    // Remove this prop if player has already interacted with it
    if (hasJournalEntry(this.player, JournalEntry.AlchemyLabFound) && this.propType === PropType.LabHatch) {
      this.destroy();
      return;
    }

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    if (Config.debug) this.setInteractive({ draggable: true });

    const particles = PropData[this.propType].particles;
    if (particles) {
      this.particles = this.scene.add.particles(this.x, this.y, 'warp', particles).setDepth(Layer.Items);
    }

    this.initialized = true;
  }

  onInteract(keys: Record<Key, boolean>): InteractResult {
    if (this.player.message.visible || Date.now() < this.player.message.interactionTimeout) return InteractResult.None;

    if (keys[Key.Continue]) {
      const dialogs = PropDialogs[this.propType] || [];
      const dialog = getDialog<Prop>(dialogs, this.player, this);

      if (dialog) {
        this.player.message.setDialog<Prop>(dialog, this, PropData[this.propType].portrait || 'player_portrait');
        return InteractResult.Prop;
      }
    }

    return InteractResult.None;
  }

  getButtonPrompt() {
    const dialogs = PropDialogs[this.propType] || [];
    const dialog = getDialog<Prop>(dialogs, this.player, this);

    return dialog ? [`Inspect ${PropType[this.propType]}`, 'Press [CONTINUE]'] : '';
  }

  update() {
    this.lazyInit();
  }
}
