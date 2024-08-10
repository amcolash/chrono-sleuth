import { GameObjects, Scene } from 'phaser';

import { Config } from '../../config';
import { updateSphinx } from '../../data/cutscene';
import { JournalData } from '../../data/journal';
import { Layer } from '../../data/layers';
import { JournalEntry, NPCType, PropType } from '../../data/types';
import { Colors, getColorNumber } from '../../utils/colors';
import { getNPC, getProp, updateWarpVisibility } from '../../utils/interactionUtils';
import { Notification } from '../UI/Notification';
import { Player } from './Player';

export class Journal extends GameObjects.Image {
  player: Player;
  journal: JournalEntry[] = [];
  unread: GameObjects.Ellipse;

  initialized: boolean = false;

  constructor(scene: Scene, player: Player) {
    super(scene, Config.width - 50, Config.height - 55, 'journal');
    this.player = player;
  }

  createUI() {
    if (this.initialized) return;

    this.setScrollFactor(0)
      .setDepth(Layer.Ui)
      .setScale(0.5)
      .setAlpha(0)
      .setInteractive({ useHandCursor: true })
      .setActive(false);
    this.on('pointerdown', this.openJournal);

    this.scene.add.existing(this);

    this.unread = this.scene.add
      .ellipse(Config.width - 21, Config.height - 89, 20, 20, 0xaa0000)
      .setStrokeStyle(2, getColorNumber(Colors.Black))
      .setScrollFactor(0)
      .setDepth(Layer.Ui2)
      .setVisible(false);

    this.initialized = true;
  }

  addEntry(entry: JournalEntry, silent?: boolean) {
    if (!this.initialized) this.createUI();

    if (this.journal.includes(entry)) return;

    if (this.journal.length === 0) {
      this.scene.tweens.add({
        targets: this,
        alpha: 1,
        duration: 300,
      });
      this.setActive(true);
    }

    this.journal.push(entry);

    if (!silent) {
      this.unread.setVisible(true);
      new Notification(this.scene, 'New journal entry added!');
    }

    this.handleSideEffects(entry, silent || false);
  }

  openJournal() {
    if (!this.initialized) this.createUI();
    if (this.journal.length === 0) return;

    this.unread.setVisible(false);
    this.scene.scene.pause();
    this.scene.scene.launch('JournalDialog', { player: this.player });
  }

  handleSideEffects(entry: JournalEntry, silent: boolean) {
    const { warpAdd } = JournalData[entry];
    if (warpAdd) updateWarpVisibility(this.scene, warpAdd, true);

    if (entry === JournalEntry.SphinxRiddleSolved) {
      updateSphinx(this.scene, true, silent);
    }

    if (entry === JournalEntry.ClockFirstGear || entry === JournalEntry.ClockSecondGear) {
      const clock = getNPC(this.scene, NPCType.ClockTower);
      if (clock?.clock) clock.clock.updateHands();
    }

    if (entry === JournalEntry.SafeDiscovered) {
      const picture = getProp(this.scene, PropType.MansionPicture);
      picture?.scene.tweens.add({
        targets: picture,
        angle: 97,
        duration: 1500,
      });
    }
  }
}
