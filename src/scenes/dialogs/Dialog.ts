import { GameObjects, Scene } from 'phaser';

import { Button } from '../../classes/UI/Button';
import { Gamepad } from '../../classes/UI/Gamepad';
import { IconButton } from '../../classes/UI/IconButton';
import { InputManager } from '../../classes/UI/InputManager';
import { Config } from '../../config';
import { Colors, getColorNumber } from '../../utils/colors';
import { fontStyle } from '../../utils/fonts';
import { Game } from '../Game';

type DialogData = {
  key: string;
  title: string;
  gamepadVisible: boolean;
  childScene?: string;
  hideCloseSuccess?: boolean;
};

export abstract class Dialog extends Scene {
  dialogData: DialogData;
  container: GameObjects.Container;
  keys: InputManager;
  title: GameObjects.Text;
  additionalUI: GameObjects.Components.AlphaSingle[];

  constructor(data: DialogData) {
    super(data.key);
    this.dialogData = data;
  }

  create() {
    this.additionalUI = [];
    this.container = this.add.container(Config.width / 2, Config.height / 2);

    this.container.add(
      this.add
        .rectangle(0, 0, Config.width * 0.95, Config.height * 0.95, 0x000000, 0.75)
        .setStrokeStyle(4, getColorNumber(Colors.Tan))
    );
    this.container.add(
      new Button(this, Config.width * 0.44, Config.height * -0.4, 'X', () => this.close(false), {
        backgroundColor: `#${Colors.Warning}`,
      })
    );

    if (!Config.prod && !this.dialogData.hideCloseSuccess) {
      this.container.add(
        new IconButton(this, Config.width * 0.38, Config.height * -0.4, 'award', () => this.close(true))
      );
    }

    this.title = this.add
      .text(0, Config.height * -0.4, this.dialogData.title, { ...fontStyle, fontSize: 48 })
      .setOrigin(0.5);
    this.container.add(this.title);

    this.input.keyboard?.on('keydown-ESC', () => {
      this.close(false);
    });

    this.input.keyboard?.on('keydown-BACKSPACE', () => {
      this.close(false);
    });

    if (!Config.prod) {
      this.input.keyboard?.on('keydown-BACK_SLASH', () => {
        this.close(true);
      });
    }

    this.keys = new InputManager(this);
    new Gamepad(this, true).setVisible(this.dialogData.gamepadVisible);

    if (this.dialogData.childScene) this.scene.launch(this.dialogData.childScene, { parent: this });

    this.container.setAlpha(0);
    this.fadeIn();
  }

  fadeIn() {
    this.time.delayedCall(100, () => {
      this.tweens.add({
        targets: this.getTargets(),
        alpha: 1,
        duration: 500,
      });
    });
  }

  getTargets() {
    return [this.container, ...this.additionalUI];
  }

  close(success?: boolean) {
    this.tweens.add({
      targets: this.getTargets(),
      alpha: 0,
      duration: 250,

      onComplete: () => {
        this.scene.stop();
        if (this.dialogData.childScene) this.scene.stop(this.dialogData.childScene);

        this.scene.resume('Game');
        (this.scene.get('Game') as Game)?.gamepad?.setAlpha(1);

        this.handleSuccess(success);
      },
    });
  }

  abstract handleSuccess(success?: boolean): void;
}
