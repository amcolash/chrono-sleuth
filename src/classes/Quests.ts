import { GameObjects } from 'phaser';

import { Config } from '../config';
import { Colors, getColorNumber } from '../utils/colors';
import { fontStyle } from '../utils/fonts';
import { Quest, QuestType } from './types';

const size = 330;

export class Quests extends GameObjects.Container {
  quests: Quest[] = [];
  questRectangle: GameObjects.Rectangle;
  shifted: boolean = true;

  constructor(scene: Phaser.Scene) {
    super(scene, Config.width - size - 20, 120);
    scene.add.existing(this);

    this.setScrollFactor(0).setDepth(1).setVisible(false);

    this.questRectangle = scene.add
      .rectangle(0, 0, size, 60, getColorNumber(Colors.Teal))
      .setStrokeStyle(2, getColorNumber(Colors.White))
      .setAlpha(0.75)
      .setOrigin(0);
    this.add(this.questRectangle);
    this.add(scene.add.text(10, 0, 'Quests', fontStyle));
  }

  addQuest(quest: Quest) {
    if (this.quests.find((q) => q.id === quest.id)) return;

    this.quests.push(quest);
    this.add(this.scene.add.text(0, 0, quest.name, { ...fontStyle, fontSize: 32 }));
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
    let maxLength = 0;
    this.getAll<GameObjects.Text>().forEach((text) => {
      if (text instanceof GameObjects.Text) {
        if (!activeQuests.find((q) => text.text === q.name) && text.text !== 'Quests') text.destroy();
        else if (text.text !== 'Quests') {
          const y = 10 + 30 * index;
          text.setPosition(10, y);
          index++;

          maxLength = Math.max(maxLength, text.width);
        }
      }
    });

    const newWidth = maxLength + 20;

    this.setX(Config.width - 20 - newWidth);
    this.setY(this.shifted ? 140 : 20);
    this.setVisible(activeQuests.length > 0);
    this.questRectangle.setSize(newWidth, 50 + 30 * activeQuests.length);
  }

  reset() {
    this.quests = [];
    this.updateQuests();
  }
}
