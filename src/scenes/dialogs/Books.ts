import { Player } from '../../classes/Player/Player';
import { Dialog } from './Dialog';

export class Books extends Dialog {
  player: Player;

  constructor() {
    super({ key: 'Books', title: 'Books', gamepadVisible: false, hideCloseSuccess: true });
  }

  preload() {
    this.load.setPath('assets');

    this.load.atlas('bookshelf', 'atlases/bookshelf.png', 'atlases/bookshelf.json');
  }

  init(data: { player: Player }) {
    this.player = data.player;
  }

  create() {
    super.create();

    const scale = 2;

    const container = this.add.container(0, 0);
    // const bookshelf = this.add.image(0, 0, 'bookshelf', 0).setScale(scale);

    const texture = this.textures.get('bookshelf');
    for (const frame of Object.entries(texture.frames)) {
      // this.add.image(frame[1].)

      console.log(frame);
    }
  }

  handleSuccess(): void {}
}
