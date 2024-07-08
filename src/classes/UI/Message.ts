import { GameObjects, Scene } from 'phaser';
import { Colors, fontStyle, getColorNumber } from '../../utils/colors';
import { Config } from '../../config';
import { NPCType } from '../types';
import { NPCData } from '../NPC';

export class Message extends GameObjects.Container {
  npcName: GameObjects.Text;
  text: GameObjects.Text;
  box: GameObjects.Rectangle;
  image: GameObjects.Image;

  constructor(scene: Scene) {
    super(scene);
    scene.add.existing(this);

    const padding = 20;
    const { width, height } = Config;
    const boxHeight = 170;

    this.setScrollFactor(0);
    this.setPosition(padding, height - padding - boxHeight);
    this.setDepth(2);
    this.setVisible(false);

    const textWidth = width - 120 - padding * 4;
    const textHeight = boxHeight - padding * 2;

    this.npcName = new GameObjects.Text(scene, padding + 150, padding - 5, '', { ...fontStyle, color: '#' + Colors.Tan });

    this.text = new GameObjects.Text(scene, padding + 150, padding + 30, '', fontStyle);
    this.text.width = textWidth;
    this.text.height = textHeight;

    this.text.setOrigin(0).setWordWrapWidth(textWidth, true).setFixedSize(textWidth, textHeight);

    this.image = new GameObjects.Image(scene, padding, padding, '').setOrigin(0).setScale(1.5);

    this.box = new GameObjects.Rectangle(scene, 0, 0, width - padding * 2, boxHeight, getColorNumber(Colors.Black), 0.7);
    this.box.setStrokeStyle(2, getColorNumber(Colors.Tan), 1);
    this.box.setOrigin(0, 0);

    this.add([this.box, this.npcName, this.text, this.image]);
  }

  setMessage(message?: string, npc?: NPCType) {
    if (message) this.text.setText(message);
    if (npc !== undefined) {
      this.npcName.setText(NPCData[npc].name);
      this.image.setTexture(NPCData[npc].portrait);
    }
    this.setVisible(!!message);

    if (this.text.getWrappedText().length > 4) console.error('Message too long!', message);
  }
}
