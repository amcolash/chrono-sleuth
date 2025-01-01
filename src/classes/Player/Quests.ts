import { GameObjects, Scene } from 'phaser';

import { Config } from '../../config';
import { updateAlchemySet } from '../../data/cutscene';
import { Layer } from '../../data/layers';
import { QuestData } from '../../data/quest';
import { ItemType, Quest, QuestType } from '../../data/types';
import { Game } from '../../scenes/Game';
import { Colors, getColorNumber } from '../../utils/colors';
import { fontStyle } from '../../utils/fonts';
import { updateWarpLocked } from '../../utils/interactionUtils';
import { autosave } from '../../utils/save';
import { Item } from '../Environment/Item';
import { Notification } from '../UI/Notification';
import { Player } from './Player';

const size = 330;

export class Quests extends GameObjects.Container {
  player: Player;
  quests: Quest[] = [];
  questRectangle: GameObjects.Rectangle;

  initialized: boolean = false;

  constructor(scene: Scene, player: Player) {
    super(scene, Config.width - size - 20, 120);
    this.player = player;
  }

  createUI() {
    if (this.initialized) return;

    this.scene.add.existing(this);

    this.setScrollFactor(0).setDepth(Layer.Ui).setVisible(false);

    this.questRectangle = this.scene.add
      .rectangle(0, 0, size, 60, getColorNumber(Colors.Teal))
      .setStrokeStyle(2, getColorNumber(Colors.White))
      .setAlpha(0.75)
      .setOrigin(0);
    this.add(this.questRectangle);

    const text = this.scene.add.text(10, 4, 'Quests', { ...fontStyle, fontSize: 32 });
    this.add(text);

    this.initialized = true;
  }

  addQuest(quest: Quest, silent?: boolean) {
    if (!this.initialized) this.createUI();
    if (this.quests.find((q) => q.id === quest.id)) return;

    this.quests.push(quest);
    this.add(this.scene.add.text(0, 0, QuestData[quest.id].description, { ...fontStyle, fontSize: 20 }));
    this.updateQuests();

    if (!silent) new Notification(this.scene, `New quest added: ${QuestData[quest.id].description}`);

    this.handleSideEffects(quest.id, quest.completed, silent);
  }

  updateExistingQuest(quest: QuestType, completed: boolean) {
    if (!this.initialized) this.createUI();

    const q = this.quests.find((q) => q.id === quest);
    if (q) {
      if (!q.completed && completed) new Notification(this.scene, `Quest completed: ${QuestData[q.id].description}`);
      q.completed = completed;

      this.updateQuests();

      this.handleSideEffects(quest, completed);
    } else {
      console.error(`Quest ${quest} not found in player quests`);
    }
  }

  updateQuests() {
    if (!this.initialized) this.createUI();

    const activeQuests = this.quests.filter((q) => !q.completed);

    let index = 1;
    let maxLength = 0;
    this.getAll<GameObjects.Text>().forEach((text) => {
      if (text instanceof GameObjects.Text) {
        if (!activeQuests.find((q) => text.text === QuestData[q.id].description) && text.text !== 'Quests')
          text.destroy();
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

  handleSideEffects(type: QuestType, completed: boolean, silent?: boolean) {
    const { warpAdd, warpComplete } = QuestData[type];
    if (warpAdd) updateWarpLocked(this.scene as Game, warpAdd, true);
    if (completed && warpComplete) updateWarpLocked(this.scene as Game, warpComplete, true);

    if (type === QuestType.FindPotionIngredients && !completed) {
      const scene = this.player.scene;

      scene.interactiveObjects.add(new Item(scene, ItemType.HerbGreen, this.player));
      scene.interactiveObjects.add(new Item(scene, ItemType.HerbBlue, this.player));
    }

    if (type === QuestType.ExploreLab && !completed) {
      updateAlchemySet(this.player);
    }

    if (!silent) autosave(this.scene as Game);
  }

  reset() {
    this.quests = [];
    this.updateQuests();
  }
}
