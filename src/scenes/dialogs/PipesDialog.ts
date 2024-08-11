import { Prop } from '../../classes/Environment/Prop';
import { Player } from '../../classes/Player/Player';
import { JournalEntry, PropType } from '../../data/types';
import { getProp } from '../../utils/interactionUtils';
import { Dialog } from './Dialog';

export class PipesDialog extends Dialog {
  player: Player;

  constructor() {
    super({
      key: 'PipesDialog',
      title: 'Attach all of the pipes to fix the alchemy set.\n[CONTINUE/CLICK] to rotate',
      gamepadVisible: false,
      childScene: 'Pipes',
    });
  }

  init(data: { player: Player; level: number }) {
    this.player = data.player;
  }

  create(): void {
    super.create();

    this.title
      .setFontSize(36)
      .setAlign('center')
      .setY(this.title.y + 10);
  }

  handleSuccess(success?: boolean): void {
    if (success) {
      this.player.message.setDialog<Prop>(
        { messages: ['There. It looks like the alchemy set is properly fit back together.'] },
        getProp(this.player.scene, PropType.AlchemySet),
        'player_portrait'
      );
      this.player.journal.addEntry(JournalEntry.AlchemySetFixed);
    }
  }
}
