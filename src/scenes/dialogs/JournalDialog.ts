import { Player } from '../../classes/Player/Player';
import { Button } from '../../classes/UI/Button';
import { TextBox } from '../../classes/UI/TextBox';
import { Config } from '../../config';
import { JournalData } from '../../data/journal';
import { Colors, getColorNumber } from '../../utils/colors';
import { noteStyle } from '../../utils/fonts';
import { Dialog } from './Dialog';

export class JournalDialog extends Dialog {
  player: Player;

  constructor() {
    super({ key: 'JournalDialog', title: 'Journal', gamepadVisible: false, hideCloseSuccess: true, skipUI: true });
  }

  init(data: { player: Player }) {
    this.player = data.player;
  }

  create() {
    super.create();

    this.container.add(this.add.image(0, 0, 'props', 'paper').setScale(2.9, 3.3));
    this.container.add(
      new Button(this, Config.width * 0.44, Config.height * -0.36, 'X', () => this.close(false), {
        ...noteStyle,
        backgroundColor: undefined,
        fontSize: 54,
      })
    );

    this.player.journal.unread.setVisible(false);

    const text = this.player.journal.journal.map((entry) => `${JournalData[entry].description}\n`).reverse();
    const textBox = new TextBox(this, Config.width * 0.08, Config.height * 0.2, text, {
      ...noteStyle,
      scrollbarColor: getColorNumber(Colors.Brown),
    });
    textBox.setBoxSize(Config.width * 0.84, Config.height * 0.62);

    // Add the text box to the additional UI and handle edge case where elements added directly are not faded in correctly
    this.addTarget(textBox);
    this.fadeIn();

    this.input.keyboard?.on('keydown-J', () => {
      this.close();
    });

    this.sound.playAudioSprite('sfx', 'book_open');
  }

  preHandleSuccess(): void {
    this.sound.playAudioSprite('sfx', 'book_close');
  }

  handleSuccess(): void {}
}
