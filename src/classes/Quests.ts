import { GameObjects } from 'phaser';
import { Quest, QuestType } from './types.';
import { Config } from '../config';
import { Colors, fontStyle, getColorNumber } from '../utils/colors';

export class Quests extends GameObjects.Container {
  quests: Quest[] = [];
  questRectangle: GameObjects.Rectangle;

  constructor(scene: Phaser.Scene) {
    super(scene, Config.width - 320, 120);
    scene.add.existing(this);

    this.setScrollFactor(0).setDepth(1).setVisible(false);

    this.questRectangle = scene.add
      .rectangle(0, 0, 300, 60, getColorNumber(Colors.Teal))
      .setStrokeStyle(2, getColorNumber(Colors.White))
      .setAlpha(0.75)
      .setOrigin(0);
    this.add(this.questRectangle);
    this.add(scene.add.text(10, 10, 'Quests', fontStyle));
  }

  addQuest(quest: Quest) {
    this.quests.push(quest);
    const y = 10 + 30 * this.quests.length;
    this.add(this.scene.add.text(10, y, quest.name, { ...fontStyle, fontSize: 18 }));
    this.updateQuests();
  }

  updateExistingQuest(quest: QuestType, completed: boolean) {
    const q = this.quests.find((q) => q.id === quest);
    if (q) q.completed = completed;
    this.updateQuests();
  }

  updateQuests() {
    const activeQuests = this.quests.filter((q) => !q.completed);

    let index = 1;
    this.getAll<GameObjects.Text>().forEach((text) => {
      if (text instanceof GameObjects.Text) {
        if (!activeQuests.find((q) => text.text === q.name) && text.text !== 'Quests') text.destroy();
        else if (text.text !== 'Quests') {
          const y = 10 + 30 * index;
          text.setPosition(10, y);
          index++;
        }
      }
    });

    this.setVisible(activeQuests.length > 0);
    this.questRectangle.setSize(300, 40 + 30 * activeQuests.length);
  }
}
