import { Input, Math, Scene } from 'phaser';
import { Config } from '../config';
import { Button } from '../classes/UI/Button';
import { Colors, fontStyle, getColorNumber } from '../utils/colors';
import { Player } from '../classes/Player';
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
      this.add.rectangle(0, 0, Config.width * 0.8, Config.height * 0.8, 0x000000, 0.6).setStrokeStyle(4, getColorNumber(Colors.Tan))
    );
    container.add(new Button(this, Config.width * 0.3, Config.height * -0.33, 'Close', () => this.close()));

    container.add(this.add.text(0, Config.height * -0.33, 'Journal', { ...fontStyle, fontSize: 36 }).setOrigin(0.5));

    // TODO: Figure out how to get this to scroll
    const text = this.add
      .text(
        0,
        Config.height * -0.2,
        this.player.journal.journal
          .map((entry) => {
            return '- ' + JournalData[entry] + '\n' + '\n';
          })
          .reverse(),
        { ...fontStyle, wordWrap: { width: Config.width * 0.7 }, align: 'left' }
      )
      .setOrigin(0.5, 0)
      .setInteractive({ draggable: true });

    text.on('drag', (_pointer: Input.Pointer, _dragX: number, dragY: number) => {
      text.y = Math.Clamp(dragY, -text.displayHeight * 0.5, -Config.height * 0.2);
    });

    container.add(text);

    // Make a mask and apply it to the text to keep inside of dialog
    const maskGraphics = this.make.graphics();
    maskGraphics.fillStyle(0xffffff);
    maskGraphics.fillRect(Config.width * 0.15, Config.height * 0.2, Config.width * 0.75, Config.height * 0.7);

    const mask = new Phaser.Display.Masks.BitmapMask(this, maskGraphics);
    text.setMask(mask);
  }

  close() {
    this.scene.stop();
    this.scene.resume('Game');
  }
}
