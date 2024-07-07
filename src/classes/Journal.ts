import { GameObjects } from 'phaser';
import { JournalEntry } from './types.';
import { Config } from '../config';

export class Journal extends GameObjects.Sprite {
  journal: JournalEntry[] = [];

  constructor(scene: Phaser.Scene) {
    super(scene, Config.width - 50, Config.height - 50, 'journal');
    this.setScrollFactor(0).setDepth(1).setScale(0.25).setAlpha(0).setInteractive().setActive(false);

    scene.add.existing(this);

    this.on('pointerdown', () => {
      // TODO: Show journal window, stop time
      this.scene.scene.pause();

      setTimeout(() => this.scene.scene.resume(), 1000);
    });
  }

  addEntry(entry: JournalEntry) {
    if (this.journal.length === 0) {
      this.scene.tweens.add({
        targets: this,
        alpha: 1,
        duration: 300,
      });
      this.setActive(true);
    }

    this.journal.push(entry);

    // TODO: Notification of new entry
  }
}
