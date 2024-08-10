import { GameObjects } from 'phaser';

import { Player } from '../../classes/Player/Player';
import { Button } from '../../classes/UI/Button';
import { TextBox } from '../../classes/UI/TextBox';
import { Config } from '../../config';
import { SaveType, saves } from '../../data/saves';
import { ItemType, JournalEntry, QuestType } from '../../data/types';
import { fontStyle } from '../../utils/fonts';
import {
  hasActiveQuest,
  hasCompletedQuest,
  hasJournalEntry,
  hasUnusedItem,
  hasUsedItem,
} from '../../utils/interactionUtils';
import { save } from '../../utils/save';
import { Dialog } from './Dialog';

enum Tab {
  Items,
  Journal,
  Quests,
  Save,
}

const sidebarWidth = 250;

const itemList = Object.keys(ItemType)
  .map((key: any) => ItemType[key])
  .filter((k) => typeof k === 'number');

const journalList = Object.keys(JournalEntry)
  .map((key: any) => JournalEntry[key])
  .filter((k) => typeof k === 'number');

const questList = Object.keys(QuestType)
  .map((key: any) => QuestType[key])
  .filter((k) => typeof k === 'number');

export class DebugTool extends Dialog {
  player: Player;
  tabs: Button[] = [];
  tab: Tab = Tab.Save;
  textBox: TextBox;
  helperText: GameObjects.Text;
  saveContainer: GameObjects.Container;

  constructor() {
    super({ key: 'DebugTool', title: 'Debug Tool', gamepadVisible: false });
  }

  init(data: { player: Player }) {
    this.player = data.player;
  }

  create() {
    super.create();

    const itemsTab = this.makeTab('Items', 0);
    const journalTab = this.makeTab('Journal', 1);
    const questsTab = this.makeTab('Quests', 2);
    const saveTab = this.makeTab('Saves', 3);

    this.helperText = this.add
      .text(Config.width * 0.94, 110, '', { ...fontStyle, fontSize: 24 })
      .setOrigin(1, 0)
      .setDepth(1);

    this.textBox = new TextBox(
      this,
      sidebarWidth + 50,
      100,
      '',
      {
        backgroundColor: '#123',
        fontSize: 32,
      },
      (line) => this.handleLineClick(line)
    ).setBoxSize(Config.width * 0.65, Config.height * 0.75);

    this.tabs = [itemsTab, journalTab, questsTab, saveTab];
    this.container.add(this.tabs);

    const debugMode = new Button(
      this,
      -this.container.x + 40,
      Config.height / 2 - 100,
      'Debug Mode',
      () => {
        Config.debug = !Config.debug;
        this.close();
      },
      { align: 'center' }
    )
      .setOrigin(0)
      .setFixedSize(sidebarWidth, 70);

    this.container.add(debugMode);

    this.saveContainer = this.add.container(0, 0);
    Object.entries(saves).forEach((s, i) => {
      const [key, data] = s;
      const button = new Button(
        this,
        sidebarWidth + 60,
        100 + 80 * i,
        SaveType[Number(key)],
        () => {
          save(this.player.scene, data);
          this.close(true);
        },
        { align: 'center' }
      )
        .setOrigin(0)
        .setFixedSize(sidebarWidth, 70);
      this.saveContainer.add(button);
    });

    this.updateTabs();
  }

  makeTab(title: string, index: number): Button {
    return new Button(
      this,
      -this.container.x + 40,
      -this.container.y + 100 + 80 * index,
      title,
      () => {
        this.tab = index;
        this.updateTabs();
      },
      {
        align: 'center',
      }
    )
      .setOrigin(0)
      .setFixedSize(sidebarWidth, 70);
  }

  handleLineClick(line: number): void {
    switch (this.tab) {
      case Tab.Items:
        const item = itemList[line];
        const inventory = this.player.inventory.inventory;
        const foundItem = inventory.find((i) => i.type === item);
        if (foundItem) {
          if (foundItem.used) inventory.splice(inventory.indexOf(foundItem), 1);
          else foundItem.used = !foundItem.used;
        } else {
          this.player.inventory.addItem({ type: item, used: false }, true);
        }
        break;
      case Tab.Journal:
        const entry = journalList[line];
        const journal = this.player.journal.journal;
        if (hasJournalEntry(journal, entry)) {
          journal.splice(journal.indexOf(entry), 1);
        } else {
          this.player.journal.addEntry(entry, true);
        }
        break;
      case Tab.Quests:
        const quest = questList[line];
        const quests = this.player.quests.quests;
        const foundQuest = quests.find((q) => q.id === quest);
        if (foundQuest) {
          if (foundQuest.completed) quests.splice(quests.indexOf(foundQuest), 1);
          else foundQuest.completed = !foundQuest.completed;
        } else {
          this.player.quests.addQuest({ id: quest, completed: false }, true);
        }
        break;
    }

    this.updateTabs();
  }

  updateTabs() {
    this.tabs.forEach((tab, i) => {
      tab.setBackgroundColor(i === this.tab ? '#123' : '#151515');
    });

    this.saveContainer?.setVisible(this.tab === Tab.Save);
    this.textBox.setVisible(this.tab !== Tab.Save);
    this.helperText.setVisible(this.tab !== Tab.Save);

    let text = '';
    switch (this.tab) {
      case Tab.Items:
        const inventory = this.player.inventory.inventory;
        text = itemList
          .map(
            (entry) =>
              `[${hasUnusedItem(inventory, entry) ? '-' : hasUsedItem(inventory, entry) ? 'x' : ' '}] ${ItemType[entry]}`
          )
          .join('\n');
        this.helperText.setText('[-] item held\n[x] item used');
        break;
      case Tab.Journal:
        const journal = this.player.journal.journal;
        text = journalList
          .map((entry) => `[${hasJournalEntry(journal, entry) ? 'x' : ' '}] ${JournalEntry[entry]}`)
          .join('\n');
        this.helperText.setText('');
        break;
      case Tab.Quests:
        const quests = this.player.quests.quests;
        text = questList
          .map(
            (entry) =>
              `[${hasActiveQuest(quests, entry) ? '-' : hasCompletedQuest(quests, entry) ? 'x' : ' '}] ${QuestType[entry]}`
          )
          .join('\n');
        this.helperText.setText('[-] quest active\n[x] quest complete');
        break;
    }

    this.textBox.setText(text);
  }

  handleSuccess(success: boolean): void {
    if (!success) save(this.player.scene);
    this.player.scene.scene.restart();
  }
}
