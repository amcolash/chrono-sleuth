import { GameObjects, Scene } from 'phaser';

import { Music } from '../../classes/Music';
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
  helpText?: string;
  gamepadVisible: boolean;
  childScene?: string;

  skipUI?: boolean;

  /** Hide the top-right button that closes a dialog in the "success state" */
  hideCloseSuccess?: boolean;
};

export abstract class Dialog extends Scene {
  dialogData: DialogData;
  container: GameObjects.Container;
  keys: InputManager;
  title: GameObjects.Text;
  helpText: GameObjects.Text;
  closing: boolean;

  /** Used to keep track of additional fading UI that is added via `addTarget` */
  private additionalUI: GameObjects.Components.AlphaSingle[];

  constructor(data: DialogData) {
    super(data.key);
    this.dialogData = data;
  }

  create() {
    this.additionalUI = [];
    this.closing = false;
    this.container = this.add.container(Config.width / 2, Config.height / 2);

    const data = this.dialogData;

    if (!data.skipUI) {
      this.container.add(
        this.add
          .rectangle(0, 0, Config.width * 0.95, Config.height * 0.95, 0x000000, 0.75)
          .setStrokeStyle(4, getColorNumber(Colors.Tan))
      );
      this.container.add(
        new Button(this, Config.width * 0.43, Config.height * -0.39, 'X', () => this.close(false), {
          backgroundColor: `#${Colors.Warning}`,
        })
      );

      if (!Config.prod && !data.hideCloseSuccess) {
        this.container.add(
          new IconButton(this, Config.width * 0.38, Config.height * -0.4, 'award', () => this.close(true))
        );
      }

      this.title = this.add.text(0, Config.height * -0.4, data.title, { ...fontStyle, fontSize: 48 }).setOrigin(0.5);
      this.container.add(this.title);

      if (data.helpText) {
        this.helpText = this.add.text(-Config.width * 0.45, Config.height * 0.2, data.helpText, fontStyle);
        this.container.add(this.helpText);
      }
    }

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

    this.container.setAlpha(0);

    // If there is a child scene, launch it and finally fade in once everything is set
    if (this.dialogData.childScene) {
      this.scene.launch(this.dialogData.childScene, { parent: this });

      const childScene = this.scene.get(this.dialogData.childScene);
      childScene.events.on('create', () => this.fadeIn());
    } else this.fadeIn();

    Music.setScene(this);
    Music.fadeMusic(0.15);
  }

  fadeIn() {
    this.tweens.killAll();

    this.tweens.add({
      targets: this.getTargets(),
      alpha: { start: 0, to: 1 },
      delay: 100,
      duration: 500,
    });
  }

  fadeOut(onComplete: () => void) {
    this.tweens.killAll();

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

  close(success?: boolean) {
    if (this.closing) return;
    this.closing = true;

    this.preHandleSuccess(success);

    const game = this.scene.get('Game') as Game;
    Music.fadeMusic(Music.volume, 500, () => Music.setScene(game));

    this.fadeOut(() => {
      this.scene.stop();
      if (this.dialogData.childScene) this.scene.stop(this.dialogData.childScene);

      this.scene.resume(game);
      game?.gamepad?.setAlpha(1);
      game?.gamepad?.resetButtons();

      this.handleSuccess(success);
    });
  }

  preHandleSuccess(success?: boolean): void {}

  abstract handleSuccess(success?: boolean): void;
}
