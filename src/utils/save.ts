import deepEqual from 'deep-equal';

import { Notification } from '../classes/UI/Notification';
import { Config } from '../config';
import { SaveData, SaveType, saveKey, saves } from '../data/saves';
import { ItemType, JournalEntry, QuestType } from '../data/types';
import { Game } from '../scenes/Game';
import { Colors } from './colors';
import { townIntro } from './cutscene';
import { toggleCrt } from './shaders/crt';
import { toggleXRay } from './shaders/xray';
import { setZoomed, transformEnumValue } from './util';

/** Get the current state of the game before saving */
export function getCurrentSaveState(scene: Game): SaveData {
  const save: SaveData = {
    player: {
      x: scene.player.x,
      y: scene.player.y,
      flip: scene.player.flipX,
    },
    journal: scene.player.journal.journal.sort(),
    inventory: scene.player.inventory.inventory.sort((a, b) => a.type - b.type),
    quests: scene.player.quests.quests.sort((a, b) => a.id - b.id),
    gameState: scene.player.gameState.data,
    settings: {
      gamepad: scene.gamepad.visible,
      debug: Config.debug,
      zoomed: Config.zoomed,
      useShader: Config.useShader,
      time: Date.now(),
      muted: scene.sound.mute,
    },
  };

  return save;
}

/** Get the saved data from local storage, default back to defaultSave if none exists or error parsing */
export function getSavedData(): { save: SaveData; error: unknown; newGame: boolean } {
  const data = localStorage.getItem(saveKey);
  let parsed: SaveData | undefined = undefined;
  let error;
  try {
    if (data) parsed = JSON.parse(data);
  } catch (err) {
    console.error(err);
    error = err;
  }

  return { save: parsed || saves[SaveType.New], error, newGame: !parsed };
}

// Mapping of keys to their respective enums
const enumMapping: Record<string, { enumObj: any; enumName: string }> = {
  journal: { enumObj: JournalEntry, enumName: 'JournalEntry' },
  inventory: { enumObj: ItemType, enumName: 'ItemType' },
  type: { enumObj: ItemType, enumName: 'ItemType' },
  quests: { enumObj: QuestType, enumName: 'QuestType' },
  id: { enumObj: QuestType, enumName: 'QuestType' },
};

/** Convert save data so that is has proper enums, instead of numbers, thanks GPT */
export function convertSaveData(save: SaveData): string {
  const jsonString = JSON.stringify(
    save,
    (key, value) => {
      const enumInfo = enumMapping[key];

      // Handle arrays with specific enum transformations for array elements
      if (Array.isArray(value) && enumInfo) {
        return value.map((item) => transformEnumValue(item, enumInfo.enumObj, enumInfo.enumName));
      }

      // Apply transformation for non-array values using mapped enums
      if (enumInfo) {
        return transformEnumValue(value, enumInfo.enumObj, enumInfo.enumName);
      }

      return value; // For non-enum and non-mapped values, return as-is
    },
    2
  );

  // Use regex to remove quotes around enum-like strings in dot notation
  return jsonString.replace(/"(\w+\.\w+)"/g, '$1');
}

function checkConfig(savedata: SaveData, scene: Game): boolean {
  // Load all new config values, then check each and optionally restart to apply
  const originalConfig = { ...Config };
  Config.debug = savedata.settings.debug;
  Config.zoomed = savedata.settings.zoomed;
  Config.useShader = savedata.settings.useShader;

  toggleCrt(Config.useShader);
  toggleXRay(scene, false, true);

  if (Config.zoomed !== originalConfig.zoomed) {
    setZoomed(scene, Config.zoomed);
    return true;
  }

  if (Config.debug !== originalConfig.debug) {
    scene.scene.restart();
    return true;
  }

  return false;
}

/** Only load the config to check if the scene needs to be restarted */
export function loadConfig(scene: Game): boolean {
  const { save: savedata } = getSavedData();

  try {
    return checkConfig(savedata, scene);
  } catch (err) {
    console.error(err);
  }

  return false;
}

export function load(scene: Game) {
  const { save: savedata, error, newGame } = getSavedData();
  if (error) {
    new Notification(scene, 'Unfortunately, it looks like this save is corrupted.\nFailed to Load Game', 10000);
  }

  try {
    checkConfig(savedata, scene);

    scene.sound.stopAll();
    scene.sound.mute = savedata.settings.muted;
    scene.player.setX(savedata.player.x);
    scene.player.setY(savedata.player.y);

    scene.player.previousPosition.set(savedata.player.x + (savedata.player.flip ? 1 : -1), savedata.player.y);

    // Delay loading this data as it can make UI which slows down initial game load
    scene.time.delayedCall(50, () => {
      try {
        scene.player.inventory.createUI();
        scene.player.quests.createUI();
        scene.player.journal.createUI();

        if (newGame) townIntro(scene);

        savedata.inventory
          .sort((a, b) => a.type - b.type)
          .forEach((item) => scene.player.inventory.addItem(item, true));

        // Journals are second, quests third. Both have side-effects, but quests always happen last
        savedata.journal
          .sort()
          .reverse()
          .forEach((entry) => scene.player.journal.addEntry(entry, true));
        savedata.quests.sort((a, b) => a.id - b.id).forEach((quest) => scene.player.quests.addQuest(quest, true));

        // Side effects of data are always last
        scene.player.gameState.updateData(savedata.gameState, true);
      } catch (err) {
        console.error(err);
        new Notification(
          scene,
          'Unfortunately, it looks like this save is corrupted.\nFailed to Load Game',
          10000,
          Colors.Warning
        );

        save(scene, saves[SaveType.New]);
        load(scene);
      }
    });

    scene.gamepad.setVisible(savedata.settings.gamepad);

    // If new game, save now
    if (deepEqual(savedata, saves[SaveType.New])) {
      save(scene, undefined, true);
    }
  } catch (err) {
    console.error(err);
    new Notification(
      scene,
      'Unfortunately, it looks like this save is corrupted.\nFailed to Load Game',
      10000,
      Colors.Warning
    );

    save(scene, saves[SaveType.New]);
    load(scene);
  }
}

export function save(scene: Game, override?: SaveData, silent?: boolean): void {
  const save = getCurrentSaveState(scene);
  localStorage.setItem(saveKey, JSON.stringify(override || save));

  if (!silent) {
    // new Notification(scene, 'Game Saved');

    scene.tweens.add({
      targets: scene.saveIcon,
      alpha: 0.7,
      scale: 0.6,
      duration: 500,
      hold: 250,
      yoyo: true,
      onComplete: () => scene.saveIcon.setAlpha(0),
    });
  }
}

export function autosave(scene: Game) {
  if (Config.prod) {
    save(scene);
  }
}
