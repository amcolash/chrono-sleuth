import { GameObjects, Scene } from 'phaser';

import { Player } from '../classes/Player/Player';
import { Button } from '../classes/UI/Button';
import { Gamepad } from '../classes/UI/Gamepad';
import { InputManager } from '../classes/UI/InputManager';
import { Config } from '../config';
import { JournalEntry } from '../data/types';
import { Colors, getColorNumber } from '../utils/colors';
import { fontStyle } from '../utils/fonts';
import { Game } from './Game';

export class PipesDialog extends Scene {
  player: Player;
  container: GameObjects.Container;
  arrow: GameObjects.Sprite;
  keys: InputManager;
  level: number;

  constructor() {
    super('PipesDialog');
  }

  init(data: { player: Player; level: number }) {
    this.player = data.player;
    this.level = data.level;
  }

  create() {
    this.container = this.add.container(Config.width / 2, Config.height / 2);

    this.container.add(
      this.add
        .rectangle(0, 0, Config.width * 0.95, Config.height * 0.95, 0x000000, 0.9)
        .setStrokeStyle(4, getColorNumber(Colors.Tan))
    );
    this.container.add(new Button(this, Config.width * 0.44, Config.height * -0.4, 'X', () => this.close(false)));

    this.container.add(
      this.add
        .text(0, Config.height * -0.4, 'Rotate the pipes to fix the alchemy equipment', { ...fontStyle, fontSize: 48 })
        .setOrigin(0.5)
    );

    this.input.keyboard?.on('keydown-ESC', () => {
      this.close(false);
    });

    this.input.keyboard?.on('keydown-BACKSPACE', () => {
      this.close(false);
    });

    new Gamepad(this, true).setVisible((this.player.scene as Game).gamepad.visible);
    this.keys = new InputManager(this);

    this.scene.launch('Pipes', { parent: this });
  }

  close(success: boolean) {
    this.scene.stop();
    this.scene.stop('Pipes');

    this.scene.resume('Game');

    if (success) {
      if (this.level === 0) {
        this.player.journal.addEntry(JournalEntry.ForestMazeSolved);
      }
    }
  }
}
