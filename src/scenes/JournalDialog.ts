import { Scene } from 'phaser';

import { Player } from '../classes/Player/Player';
import { Button } from '../classes/UI/Button';
import { Gamepad } from '../classes/UI/Gamepad';
import { TextBox } from '../classes/UI/TextBox';
import { Config } from '../config';
import { JournalData } from '../data/journal';
import { Colors, getColorNumber } from '../utils/colors';
import { fontStyle } from '../utils/fonts';

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
    container.add(
      new Button(this, Config.width * 0.37, Config.height * -0.33, 'X', () => this.close(), {
        backgroundColor: `#${Colors.Warning}`,
      })
    );

    container.add(this.add.text(0, Config.height * -0.33, 'Journal', { ...fontStyle, fontSize: 48 }).setOrigin(0.5));

    const text = this.player.journal.journal.map((entry) => `- ${JournalData[entry].description}\n`).reverse();
    const textBox = new TextBox(this, Config.width * 0.13, Config.height * 0.25, text, { fontSize: 32 });
    textBox.setBoxSize(Config.width * 0.74, Config.height * 0.62);

    new Gamepad(this).setVisible(false);

    this.input.keyboard?.on('keydown-J', () => {
      this.close();
    });

    this.input.keyboard?.on('keydown-ESC', () => {
      this.close();
    });

    this.input.keyboard?.on('keydown-BACKSPACE', () => {
      this.close();
    });
  }

  close() {
    this.scene.stop();
    this.scene.resume('Game');
  }
}
