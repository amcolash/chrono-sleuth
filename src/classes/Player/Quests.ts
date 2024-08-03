import { GameObjects, Scene } from 'phaser';

import { Config } from '../../config';
import { Layer } from '../../data/layers';
import { QuestNames } from '../../data/quest';
import { Quest, QuestType } from '../../data/types';
import { Game } from '../../scenes/Game';
import { Colors, getColorNumber } from '../../utils/colors';
import { fontStyle } from '../../utils/fonts';
import { Notification } from '../UI/Notification';

const size = 330;

export class Quests extends GameObjects.Container {
  quests: Quest[] = [];
  questRectangle: GameObjects.Rectangle;

  constructor(scene: Scene) {
    super(scene, Config.width - size - 20, 120);
    scene.add.existing(this);

    this.setScrollFactor(0).setDepth(Layer.Ui).setVisible(false);

    this.questRectangle = scene.add
      .rectangle(0, 0, size, 60, getColorNumber(Colors.Teal))
      .setStrokeStyle(2, getColorNumber(Colors.White))
      .setAlpha(0.75)
      .setOrigin(0);
    this.add(this.questRectangle);
    this.add(scene.add.text(10, 4, 'Quests', { ...fontStyle, fontSize: 32 }));
  }

  addQuest(quest: Quest, silent?: boolean) {
    if (this.quests.find((q) => q.id === quest.id)) return;

    this.quests.push(quest);
    this.add(this.scene.add.text(0, 0, QuestNames[quest.id], { ...fontStyle, fontSize: 20 }));
    this.updateQuests();

    if (!silent) new Notification(this.scene, `New quest added: ${QuestNames[quest.id]}`);
  }

  updateExistingQuest(quest: QuestType, completed: boolean) {
    const q = this.quests.find((q) => q.id === quest);
    if (q) {
      if (!q.completed && completed) new Notification(this.scene, `Quest completed: ${QuestNames[q.id]}`);
      q.completed = completed;
    }
    this.updateQuests();
  }

  updateQuests() {
    const activeQuests = this.quests.filter((q) => !q.completed);

    let index = 1;
    let maxLength = 0;
    this.getAll<GameObjects.Text>().forEach((text) => {
      if (text instanceof GameObjects.Text) {
        if (!activeQuests.find((q) => text.text === QuestNames[q.id]) && text.text !== 'Quests') text.destroy();
        else if (text.text !== 'Quests') {
          const y = 14 + 30 * index;
          text.setPosition(10, y);
          index++;

          maxLength = Math.max(maxLength, text.width);
        }
      }
    });

    const newWidth = maxLength + 20;

    this.setX(Config.width - 20 - newWidth);
    this.setY((this.scene as Game).player.inventory.inventory.length > 0 ? 140 : 20);
    this.setVisible(activeQuests.length > 0);
    this.questRectangle.setSize(newWidth, 50 + 30 * activeQuests.length);
  }

  reset() {
    this.quests = [];
    this.updateQuests();
  }
}
