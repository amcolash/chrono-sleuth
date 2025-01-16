import { GameObjects } from 'phaser';

import { Player } from '../../classes/Player/Player';
import { Button, CenteredButton } from '../../classes/UI/Button';
import { TextBox } from '../../classes/UI/TextBox';
import { Config } from '../../config';
import { itemList, journalList, questList, sceneList, warpList } from '../../data/arrays';
import { SaveType, saveKey, saves } from '../../data/saves';
import { ItemType, JournalEntry, QuestType, WarpType } from '../../data/types';
import { Voice } from '../../data/voices';
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
import { convertSaveData, getCurrentSaveState, save } from '../../utils/save';
import { openDialog } from '../../utils/util';
import { Game } from '../Game';
import { Dialog } from './Dialog';

enum Tab {
  Items,
  Journal,
  Quests,
  State,
  Warp,
  Saves,
  Misc,
}

const sidebarWidth = 250;
const lastDebugKey = 'chrono-sleuth-debug-tab';

export class DebugTool extends Dialog {
  player: Player;
  tabs: Button[] = [];
  tab: Tab = Tab.Items;

  mainContainer: GameObjects.Container;

  textBox: TextBox;
  helperText: GameObjects.Text;
  stateContainer: GameObjects.Container;
  saveContainer: GameObjects.Container;
  miscContainer: GameObjects.Container;

  preSave: string;

  testVoice: Voice = {
    octave: 3.5,
    speed: 1,
    volume: 1,
    type: 'sine',
  };

  constructor() {
    super({ key: 'DebugTool', title: 'Debug Tool', gamepadVisible: false, hideCloseSuccess: true });

    const lastTab = localStorage.getItem(lastDebugKey);
    if (lastTab) this.tab = Number(lastTab);
  }

  init(data: { player: Player }) {
    this.player = data.player;

    const preSave = getCurrentSaveState(this.player.scene);
    preSave.settings.time = 0;
    this.preSave = JSON.stringify(preSave);
  }

  create() {
    super.create();

    this.mainContainer = this.add.container(-Config.width / 2, -Config.height / 2);
    this.container.add(this.mainContainer);

    this.mainContainer.add(
      this.add
        .rectangle(sidebarWidth + 50, 100, Config.width * 0.65, Config.height * 0.75, getColorNumber('#112233'))
        .setOrigin(0)
    );

    const itemsTab = this.makeTab('Items', Tab.Items);
    const journalTab = this.makeTab('Journal', Tab.Journal);
    const questsTab = this.makeTab('Quests', Tab.Quests);
    const stateTab = this.makeTab('State', Tab.State);
    const warpTab = this.makeTab('Warp', Tab.Warp);
    const saveTab = this.makeTab('Saves', Tab.Saves);
    const miscTab = this.makeTab('Misc', Tab.Misc);

    this.textBox = new TextBox(
      this,
      sidebarWidth + 50,
      100,
      '',
      {
        // backgroundColor: '#123',
        fontSize: 32,
      },
      (line) => this.handleLineClick(line)
    ).setBoxSize(Config.width * 0.38, Config.height * 0.75);
    this.mainContainer.add(this.textBox);

    this.helperText = this.add
      .text(Config.zoomed ? Config.width * 0.94 : Config.width * 0.87, 110, '', { ...fontStyle, fontSize: 24 })
      .setOrigin(1, 0)
      .setDepth(1);
    this.mainContainer.add(this.helperText);

    this.tabs = [itemsTab, journalTab, questsTab, stateTab, warpTab, saveTab, miscTab];
    this.container.add(this.tabs);

    this.createStateContainer();
    this.createSaveContainer();
    this.createMiscContainer();

    this.updateTabs();

    this.input.keyboard?.on('keydown-CLOSED_BRACKET', () => {
      this.close();
    });
  }

  createStateContainer() {
    this.stateContainer = this.add.container(sidebarWidth + 60, 100);
    this.mainContainer.add(this.stateContainer);

    const data = this.player.gameState.data;

    Object.entries(data).forEach((s, i) => {
      const [key, value] = s;

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
    const button = new CenteredButton(
      this,
      x,
      y,
      text,
      onClick,
      {
        fontSize: 36,
        backgroundColor: '#111',
        padding: { x: 6, y: -4 },
      },
      null
    );

    return button;
  }

  createSaveContainer() {
    this.saveContainer = this.add.container(sidebarWidth + 60, 100);
    this.mainContainer.add(this.saveContainer);

    Object.entries(saves).forEach((s, i) => {
      const [key, data] = s;
      const button = new CenteredButton(
        this,
        0,
        10 + 60 * i,
        SaveType[Number(key)],
        () => {
          if (Number(key) === SaveType.New) {
            localStorage.removeItem(saveKey);
            window.location.reload();
          } else {
            save(this.player.scene, data);
            this.player.x += 0.1; // modify player position to trigger scene restart
            this.close(true);
          }
        },
        { backgroundColor: '#111' }
      );
      this.saveContainer.add(button);
    });

    const debugSave = new CenteredButton(
      this,
      350,
      10,
      'Dump Save',
      () => {
        const data = getCurrentSaveState(this.player.scene);
        const converted = convertSaveData(data);
        navigator.clipboard.writeText(converted).catch((err) => console.error(err));
        console.warn('save copied to clipboard!');
        console.log(converted);
      },
      { backgroundColor: '#111' }
    );
    this.saveContainer.add(debugSave);
  }

  createMiscContainer() {
    this.miscContainer = this.add.container(sidebarWidth + 60, 100);
    this.mainContainer.add(this.miscContainer);

    let y = 10;
    const debugMode = new CenteredButton(
      this,
      350,
      (y += 60),
      'Debug Mode',
      () => {
        Config.debug = !Config.debug;
        this.close();
      },
      { backgroundColor: '#111' }
    );
    this.miscContainer.add(debugMode);

    const clearCache = new CenteredButton(
      this,
      350,
      (y += 60),
      'Clear Cache',
      async () => {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          await caches.delete(cacheName);
        }

        window.location.reload();
      },
      { backgroundColor: '#111' }
    );

    this.miscContainer.add(clearCache);
  }

  makeTab(title: string, index: number): Button {
    return new CenteredButton(this, -this.container.x + 40, -this.container.y + 100 + 60 * index, title, () => {
      this.tab = index;
      localStorage.setItem(lastDebugKey, String(index));
      this.updateTabs();
    });
  }

  rangeInput(x: number, y: number, value: () => number, setValue: (value: number) => void, label: string) {
    const text = this.add.text(x, y, `${label}: ${value().toFixed(1)}`, { ...fontStyle });
    const minus = this.smallButton(x + 130, y, '-', () => {
      setValue(value() - 0.1);
      text.text = `${label}: ${value().toFixed(1)}`;
    });
    const plus = this.smallButton(x + 170, y, '+', () => {
      setValue(value() + 0.1);
      text.text = `${label}: ${value().toFixed(1)}`;
    });

    return [text, minus, plus];
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
      case Tab.Misc:
        if (line > 1) {
          const scene = sceneList[line - 2];

          if (scene === 'MainMenu') {
            this.scene.sendToBack('Game');
            this.scene.start(scene);
          } else {
            this.scene.stop(this);
            this.scene.resume('Game');
            (this.scene.get('Game') as Game)?.gamepad?.setAlpha(1);

            openDialog(this.player.scene, scene);
          }
        }
        break;
    }

    this.updateTabs();
  }

  updateTabs() {
    this.tabs.forEach((tab, i) => {
      tab.setBackgroundColor(i === this.tab ? '#123' : '#151515');
    });

    const showTextBox =
      this.tab === Tab.Items ||
      this.tab === Tab.Journal ||
      this.tab === Tab.Quests ||
      this.tab === Tab.Warp ||
      this.tab === Tab.Misc;

    const showHelper = this.tab === Tab.Items || this.tab === Tab.Quests;

    this.stateContainer?.setVisible(this.tab === Tab.State);
    this.saveContainer?.setVisible(this.tab === Tab.Saves);
    this.miscContainer?.setVisible(this.tab === Tab.Misc);

    this.textBox.setVisible(showTextBox);
    this.helperText.setVisible(showHelper);

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
        break;
      case Tab.Misc:
        text = ['Scenes', '-----------------', ...sceneList].join('\n');
        break;
    }

    this.textBox.setText(text);
  }

  handleSuccess(success: boolean): void {
    // Check if the scene should restart (only if data changed)
    const postSave = getCurrentSaveState(this.player.scene);
    postSave.settings.time = 0;
    if (this.preSave === JSON.stringify(postSave)) return;

    if (!success) save(this.player.scene);
    this.player.scene.scene.restart();
  }
}
