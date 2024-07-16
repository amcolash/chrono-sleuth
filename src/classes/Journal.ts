import { GameObjects } from 'phaser';

import { Config } from '../config';
import { Colors, getColorNumber } from '../utils/colors';
import { updateSphinx } from '../utils/interactionUtils';
import { Player } from './Player';
import { Notification } from './UI/Notification';
import { JournalEntry } from './types';

export class Journal extends GameObjects.Sprite {
  player: Player;
  journal: JournalEntry[] = [];
  unread: GameObjects.Ellipse;

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, Config.width - 50, Config.height - 55, 'journal');
    this.setScrollFactor(0).setDepth(1).setScale(0.5).setAlpha(0).setInteractive().setActive(false);
    this.on('pointerdown', this.openJournal);

    scene.add.existing(this);

    this.player = player;

    this.unread = scene.add
      .ellipse(Config.width - 21, Config.height - 89, 20, 20, 0xaa0000)
      .setStrokeStyle(2, getColorNumber(Colors.Black))
      .setScrollFactor(0)
      .setDepth(2)
      .setVisible(false);
  }

  addEntry(entry: JournalEntry, silent?: boolean) {
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

    this.handleSideEffects(entry);
  }

  openJournal() {
    if (this.journal.length === 0) return;

    this.unread.setVisible(false);
    this.scene.scene.pause();
    this.scene.scene.launch('JournalDialog', { player: this.player });
  }

  handleSideEffects(entry: JournalEntry) {
    if (entry === JournalEntry.SphinxRiddleSolved) {
      updateSphinx(this.scene, true);
    }
  }
}
