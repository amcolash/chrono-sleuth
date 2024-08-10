import { GameObjects, Scene } from 'phaser';

import { Button } from '../../classes/UI/Button';
import { Gamepad } from '../../classes/UI/Gamepad';
import { InputManager } from '../../classes/UI/InputManager';
import { Config } from '../../config';
import { Colors, getColorNumber } from '../../utils/colors';
import { fontStyle } from '../../utils/fonts';

type DialogData = {
  key: string;
  title: string;
  gamepadVisible: boolean;
  childScene?: string;
};

export abstract class Dialog extends Scene {
  dialogData: DialogData;
  container: GameObjects.Container;
  keys: InputManager;

  constructor(data: DialogData) {
    super(data.key);
    this.dialogData = data;
  }

  create() {
    this.container = this.add.container(Config.width / 2, Config.height / 2);

    this.container.add(
      this.add
        .rectangle(0, 0, Config.width * 0.95, Config.height * 0.95, 0x000000, 0.9)
        .setStrokeStyle(4, getColorNumber(Colors.Tan))
    );
    this.container.add(
      new Button(this, Config.width * 0.44, Config.height * -0.4, 'X', () => this.close(false), {
        backgroundColor: `#${Colors.Warning}`,
      })
    );
    this.container.add(
      this.add.text(0, Config.height * -0.4, this.dialogData.title, { ...fontStyle, fontSize: 48 }).setOrigin(0.5)
    );

    this.input.keyboard?.on('keydown-ESC', () => {
      this.close(false);
    });

    this.input.keyboard?.on('keydown-BACKSPACE', () => {
      this.close(false);
    });

    if (import.meta.env.MODE === 'development') {
      this.input.keyboard?.on('keydown-BACK_SLASH', () => {
        this.close(true);
      });
    }

    this.keys = new InputManager(this);
    new Gamepad(this).setVisible(this.dialogData.gamepadVisible);

    if (this.dialogData.childScene) this.scene.launch(this.dialogData.childScene, { parent: this });
  }

  close(success?: boolean) {
    this.scene.stop();
    if (this.dialogData.childScene) this.scene.stop(this.dialogData.childScene);

    this.scene.resume('Game');

    this.handleSuccess(success);
  }

  abstract handleSuccess(success?: boolean): void;
}
