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
  closing: boolean;

  constructor(data: DialogData) {
    super(data.key);
    this.dialogData = data;
    this.closing = false;
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
        new IconButton(this, Config.width * 0.38, Config.height * -0.4, 'award', () => this.startClose(true))
      );
    }

    this.title = this.add
      .text(0, Config.height * -0.4, this.dialogData.title, { ...fontStyle, fontSize: 48 })
      .setOrigin(0.5);
    this.container.add(this.title);

    this.input.keyboard?.on('keydown-ESC', () => {
      this.startClose(false);
    });

    this.input.keyboard?.on('keydown-BACKSPACE', () => {
      this.startClose(false);
    });

    if (!Config.prod) {
      this.input.keyboard?.on('keydown-BACK_SLASH', () => {
        this.startClose(true);
      });
    }

    this.keys = new InputManager(this);
    new Gamepad(this, true).setVisible(this.dialogData.gamepadVisible);

    this.container.setAlpha(0);

    // If there is a child scene, launch it and finally fade in once everything is set
    if (this.dialogData.childScene) {
      this.scene.launch(this.dialogData.childScene, { parent: this });

      const childScene = this.scene.get(this.dialogData.childScene);
      childScene.events.on('create', () => this.fadeIn());
    } else this.fadeIn();
  }

  fadeIn() {
    this.tweens.add({
      targets: this.getTargets(),
      alpha: { start: 0, to: 1 },
      delay: 100,
      duration: 500,
    });
  }

  fadeOut(onComplete: () => void) {
    this.tweens.add({
      targets: this.getTargets(),
      alpha: { start: 1, to: 0 },
      duration: 250,
      hold: 250,
      onComplete,
    });
  }

  addTarget(target: GameObjects.Components.AlphaSingle) {
    target.setAlpha(0);
    this.additionalUI.push(target);
  }

  getTargets() {
    return [this.container, ...this.additionalUI];
  }

  // Only attempt to close the dialog if not already closing
  startClose(success?: boolean) {
    if (!this.closing) {
      this.closing = true;
      this.close(success);
    }
  }

  close(success?: boolean) {
    this.fadeOut(() => {
      this.scene.stop();
      if (this.dialogData.childScene) this.scene.stop(this.dialogData.childScene);

      this.scene.resume('Game');
      (this.scene.get('Game') as Game)?.gamepad?.setAlpha(1);

      this.handleSuccess(success);
    });
  }

  abstract handleSuccess(success?: boolean): void;
}
