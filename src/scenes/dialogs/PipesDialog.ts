import { Prop } from '../../classes/Environment/Prop';
import { Player } from '../../classes/Player/Player';
import { JournalEntry, PropType } from '../../data/types';
import { getProp } from '../../utils/interactionUtils';
import { Dialog } from './Dialog';
import { Pipes } from './Pipes';

export class PipesDialog extends Dialog {
  player: Player;

  constructor() {
    super({
      key: 'PipesDialog',
      title: 'Attach all of the pipes to fix the alchemy set',
      helpText: 'Use [Left]/[Right]/[UP]/[DOWN]\nto select a pipe\n\n[CONTINUE]/[CLICK] to rotate',
      gamepadVisible: false,
      childScene: 'Pipes',
    });
  }

  init(data: { player: Player }) {
    this.player = data.player;
  }

  create(): void {
    super.create();

    this.title
      .setFontSize(36)
      .setAlign('center')
      .setY(this.title.y + 10);
  }

  close(success?: boolean): void {
    const childScene = this.scene.get('Pipes');
    if (success && childScene) {
      (childScene as Pipes).completed(() => super.close(success));
    } else super.close(success);
  }

  handleSuccess(success?: boolean): void {
    if (success) {
      this.player.message.setDialog<Prop>(
        {
          messages: ['There. It looks like the alchemy set has been properly fit back together.'],
          onCompleted: (player) => {
            player.journal.addEntry(JournalEntry.AlchemySetFixed);
          },
        },
        getProp(this.player.scene, PropType.AlchemySet),
        'player_portrait'
      );
    }
  }
}
