import { GameObjects } from 'phaser';

import { Player } from '../../classes/Player/Player';
import { Button } from '../../classes/UI/Button';
import { TextBox } from '../../classes/UI/TextBox';
import { Config } from '../../config';
import { SaveType, saves } from '../../data/saves';
import { ItemType, JournalEntry, QuestType, WarpType } from '../../data/types';
import { WarpData } from '../../data/warp';
import { getColorNumber } from '../../utils/colors';
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
  State,
  Saves,
  Warp,
}

const sidebarWidth = 250;
const lastDebugKey = 'chrono-sleuth-debug-tab';

const itemList = Object.keys(ItemType)
  .map((key: any) => ItemType[key])
  .filter((k) => typeof k === 'number');

const journalList = Object.keys(JournalEntry)
  .map((key: any) => JournalEntry[key])
  .filter((k) => typeof k === 'number');

const questList = Object.keys(QuestType)
  .map((key: any) => QuestType[key])
  .filter((k) => typeof k === 'number');

const warpList = Object.keys(WarpType)
  .map((key: any) => WarpType[key])
  .filter((k) => typeof k === 'number');

export class DebugTool extends Dialog {
  player: Player;
  tabs: Button[] = [];
  tab: Tab = Tab.Items;
  textBox: TextBox;
  helperText: GameObjects.Text;
  stateContainer: GameObjects.Container;
  saveContainer: GameObjects.Container;

  constructor() {
    super({ key: 'DebugTool', title: 'Debug Tool', gamepadVisible: false });

    const lastTab = localStorage.getItem(lastDebugKey);
    if (lastTab) this.tab = Number(lastTab);
  }

  init(data: { player: Player }) {
    this.player = data.player;
  }

  create() {
    super.create();

    this.add
      .rectangle(sidebarWidth + 50, 100, Config.width * 0.65, Config.height * 0.75, getColorNumber('#112233'))
      .setOrigin(0);

    const itemsTab = this.makeTab('Items', Tab.Items);
    const journalTab = this.makeTab('Journal', Tab.Journal);
    const questsTab = this.makeTab('Quests', Tab.Quests);
    const stateTab = this.makeTab('State', Tab.State);
    const saveTab = this.makeTab('Saves', Tab.Saves);
    const warpTab = this.makeTab('Warp', Tab.Warp);

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

    this.tabs = [itemsTab, journalTab, questsTab, stateTab, saveTab, warpTab];
    this.container.add(this.tabs);

    const debugMode = new Button(
      this,
      -this.container.x + 40,
      -Config.height / 2 + 20,
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

    this.createStateContainer();
    this.createSaveContainer();

    this.updateTabs();
  }

  createStateContainer() {
    this.stateContainer = this.add.container(sidebarWidth + 60, 100);

    const data = this.player.gameState.data;

    Object.entries(data).forEach((s, i) => {
      const [key, value] = s;

      // console.log(key, data, s, i);

      const text = this.add.text(0, 20 + 40 * i, `${key}: ${value}`, { ...fontStyle, fontSize: 32 }).setOrigin(0);
      this.stateContainer.add(text);

      switch (typeof value) {
        case 'boolean':
          text.setText(`${value ? '[x]' : '[ ]'} ${key}`);
          text.setInteractive().on('pointerdown', () => {
            /* @ts-ignore */
            data[key] = !data[key];
            /* @ts-ignore */
            text.setText(`${data[key] ? '[x]' : '[ ]'} ${key}`);
          });
          break;
        case 'number':
          const minus = this.smallButton(text.width + 20, 22 + 40 * i, '-', () => {
            /* @ts-ignore */
            data[key]--;
            /* @ts-ignore */
            text.setText(`${key}: ${data[key]}`);
          });

          const plus = this.smallButton(text.width + 55, 22 + 40 * i, '+', () => {
            /* @ts-ignore */
            data[key]++;
            /* @ts-ignore */
            text.setText(`${key}: ${data[key]}`);
          });

          this.stateContainer.add([minus, plus]);
          break;
        default:
          break;
      }
    });
  }

  smallButton(x: number, y: number, text: string, onClick: () => void): Button {
    const button = new Button(this, x, y, text, onClick, {
      fontSize: 36,
      backgroundColor: '#111',
      padding: { x: 6, y: -4 },
      align: 'center',
    }).setOrigin(0);

    return button;
  }

  createSaveContainer() {
    this.saveContainer = this.add.container(sidebarWidth + 60, 100);
    Object.entries(saves).forEach((s, i) => {
      const [key, data] = s;
      const button = new Button(
        this,
        0,
        10 + 80 * i,
        SaveType[Number(key)],
        () => {
          save(this.player.scene, data);
          this.close(true);
        },
        { align: 'center', backgroundColor: '#111' }
      )
        .setOrigin(0)
        .setFixedSize(sidebarWidth, 70);
      this.saveContainer.add(button);
    });
  }

  makeTab(title: string, index: number): Button {
    return new Button(
      this,
      -this.container.x + 40,
      -this.container.y + 100 + 64 * index,
      title,
      () => {
        this.tab = index;
        localStorage.setItem(lastDebugKey, String(index));
        this.updateTabs();
      },
      {
        fontSize: 32,
        align: 'center',
      }
    )
      .setOrigin(0)
      .setFixedSize(sidebarWidth, 54);
  }

  handleLineClick(line: number): void {
    switch (this.tab) {
      case Tab.Items:
        const item = itemList[line] as ItemType;
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
        const entry = journalList[line] as JournalEntry;
        const journal = this.player.journal.journal;
        if (hasJournalEntry(this.player, entry)) {
          journal.splice(journal.indexOf(entry), 1);
        } else {
          this.player.journal.addEntry(entry, true);
        }
        break;
      case Tab.Quests:
        const quest = questList[line] as QuestType;
        const quests = this.player.quests.quests;
        const foundQuest = quests.find((q) => q.id === quest);
        if (foundQuest) {
          if (foundQuest.completed) quests.splice(quests.indexOf(foundQuest), 1);
          else foundQuest.completed = !foundQuest.completed;
        } else {
          this.player.quests.addQuest({ id: quest, completed: false }, true);
        }
        break;
      case Tab.Warp:
        const warp = warpList[line] as WarpType;
        const warpData = WarpData[warp];
        this.player.setPosition(warpData.x, warpData.y);
        this.close();
        break;
    }

    this.updateTabs();
  }

  updateTabs() {
    this.tabs.forEach((tab, i) => {
      tab.setBackgroundColor(i === this.tab ? '#123' : '#151515');
    });

    const showText =
      this.tab === Tab.Items || this.tab === Tab.Journal || this.tab === Tab.Quests || this.tab === Tab.Warp;

    this.stateContainer?.setVisible(this.tab === Tab.State);
    this.saveContainer?.setVisible(this.tab === Tab.Saves);

    this.textBox.setVisible(showText);
    this.helperText.setVisible(showText);

    let text = '';
    switch (this.tab) {
      case Tab.Items:
        text = itemList
          .map(
            (entry) =>
              `[${hasUnusedItem(this.player, entry) ? '-' : hasUsedItem(this.player, entry) ? 'x' : ' '}] ${ItemType[entry]}`
          )
          .join('\n');
        this.helperText.setText('[-] item held\n[x] item used');
        break;
      case Tab.Journal:
        text = journalList
          .map((entry) => `[${hasJournalEntry(this.player, entry) ? 'x' : ' '}] ${JournalEntry[entry]}`)
          .join('\n');
        this.helperText.setText('');
        break;
      case Tab.Quests:
        text = questList
          .map(
            (entry) =>
              `[${hasActiveQuest(this.player, entry) ? '-' : hasCompletedQuest(this.player, entry) ? 'x' : ' '}] ${QuestType[entry]}`
          )
          .join('\n');
        this.helperText.setText('[-] quest active\n[x] quest complete');
        break;
      case Tab.Warp:
        text = warpList.map((entry) => WarpType[entry]).join('\n');
        this.helperText.setText('');
        break;
    }

    this.textBox.setText(text);
  }

  handleSuccess(success: boolean): void {
    if (!success) save(this.player.scene);
    this.player.scene.scene.restart();
  }
}