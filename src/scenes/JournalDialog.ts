import { Scene } from 'phaser';

import { Player } from '../classes/Player';
import { Button } from '../classes/UI/Button';
import { TextBox } from '../classes/UI/TextBox';
import { Config } from '../config';
import { Colors, getColorNumber } from '../utils/colors';
import { fontStyle } from '../utils/fonts';
import { JournalData } from '../utils/journalData';

export class JournalDialog extends Scene {
  player: Player;

  constructor() {
    super('JournalDialog');
  }

  init(data: { player: Player }) {
    this.player = data.player;
  }

  create() {
    const container = this.add.container(Config.width / 2, Config.height / 2);

    container.add(
      this.add
        .rectangle(0, 0, Config.width * 0.8, Config.height * 0.8, 0x000000, 0.75)
        .setStrokeStyle(4, getColorNumber(Colors.Tan))
    );
    container.add(new Button(this, Config.width * 0.3, Config.height * -0.33, 'Close', () => this.close()));

    container.add(this.add.text(0, Config.height * -0.33, 'Journal', { ...fontStyle, fontSize: 48 }).setOrigin(0.5));

    const text = this.player.journal.journal.map((entry) => `- ${JournalData[entry]}\n\n`).reverse();
    const textBox = new TextBox(this, Config.width * 0.13, Config.height * 0.25, text);
    textBox.setBoxSize(Config.width * 0.74, Config.height * 0.62);

    this.input.keyboard?.on('keydown-J', () => {
      this.close();
    });

    this.input.keyboard?.on('keydown-ESC', () => {
      this.close();
    });
  }

  close() {
    this.scene.stop();
    this.scene.resume('Game');
  }
}