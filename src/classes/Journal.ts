import { GameObjects } from 'phaser';
import { JournalEntry } from './types';
import { Config } from '../config';
import { Player } from './Player';
import { Notification } from './UI/Notification';

export class Journal extends GameObjects.Sprite {
  player: Player;
  journal: JournalEntry[] = [];

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, Config.width - 50, Config.height - 50, 'journal');
    this.setScrollFactor(0).setDepth(1).setScale(0.5).setAlpha(0).setInteractive().setActive(false);
    scene.add.existing(this);

    this.player = player;

    this.on('pointerdown', () => {
      this.scene.scene.pause();
      this.scene.scene.launch('JournalDialog', { player: this.player });
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
    new Notification(this.scene, 'New joural entry added!');
  }
}
