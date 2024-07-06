import { GameObjects } from 'phaser';
import { Colors, fontStyle, getColorNumber } from '../utils/colors';
import { Config } from '../config';

export class Message extends Phaser.GameObjects.Container {
  text: GameObjects.Text;
  box: GameObjects.Rectangle;

  constructor(scene: Phaser.Scene) {
    super(scene);
    scene.add.existing(this);

    const padding = 20;
    const { width, height } = Config;
    const boxHeight = 180;

    this.setScrollFactor(0);
    this.setPosition(padding, height - padding - boxHeight);
    this.setDepth(2);
    this.setVisible(false);

    const textWidth = width - padding * 4;
    const textHeight = boxHeight - padding * 2;

    this.text = new Phaser.GameObjects.Text(scene, padding, padding, '', fontStyle);
    this.text.width = textWidth;
    this.text.height = textHeight;

    this.text.setOrigin(0, 0);
    this.text.setWordWrapWidth(textWidth, true);
    this.text.setFixedSize(textWidth, textHeight);
    // this.text.setCrop(0, 0, width - padding * 4, boxHeight - padding * 2);

    this.box = new Phaser.GameObjects.Rectangle(scene, 0, 0, width - padding * 2, boxHeight, getColorNumber(Colors.Black), 0.7);
    this.box.setStrokeStyle(2, getColorNumber(Colors.White), 1);
    this.box.setOrigin(0, 0);

    this.add([this.box, this.text]);
  }

  setMessage(message?: string) {
    if (message) this.text.setText(message);
    this.setVisible(!!message);

    if (this.text.getWrappedText().length > 5) console.error('Message too long!', message);
  }
}
