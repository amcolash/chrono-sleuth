import { Player } from '../../classes/Player/Player';
import { TextBox } from '../../classes/UI/TextBox';
import { Config } from '../../config';
import { JournalData } from '../../data/journal';
import { Dialog } from './Dialog';

export class JournalDialog extends Dialog {
  player: Player;

  constructor() {
    super({ key: 'JournalDialog', title: 'Journal', gamepadVisible: false, hideCloseSuccess: true });
  }

  init(data: { player: Player }) {
    this.player = data.player;
  }

  create() {
    super.create();

    this.player.journal.unread.setVisible(false);

    const text = this.player.journal.journal.map((entry) => `- ${JournalData[entry].description}\n`).reverse();
    const textBox = new TextBox(this, Config.width * 0.08, Config.height * 0.25, text, { fontSize: 32 });
    textBox.setBoxSize(Config.width * 0.84, Config.height * 0.62);

    // Add the text box to the additional UI and handle edge case where elements added directly are not faded in correctly
    this.addTarget(textBox);
    this.fadeIn();

    this.input.keyboard?.on('keydown-J', () => {
      this.close();
    });

    this.sound.play('book_open');
  }

  preHandleSuccess(): void {
    this.sound.play('book_close');
  }

  handleSuccess(): void {}
}
