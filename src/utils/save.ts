import deepEqual from 'deep-equal';

import { InventoryData } from '../classes/Player/Inventory';
import { playerStart } from '../classes/Player/Player';
import { Notification } from '../classes/UI/Notification';
import { Config } from '../config';
import { ItemType, JournalEntry, Quest, QuestType } from '../data/types';
import { Game } from '../scenes/Game';
import { isMobile, setZoomed } from './util';

export const saveKey = 'chrono-sleuth-save';

// TODO: Add settings
export type Settings = {
  gamepad: boolean;
  debug: boolean;
  zoomed: boolean;
};

type SaveData = {
  player: {
    x: number;
    y: number;
    flip: boolean;
  };
  journal: JournalEntry[];
  inventory: InventoryData[];
  quests: Quest[];
  settings: Settings;
};

export const defaultSave: SaveData = {
  player: {
    x: playerStart.x,
    y: playerStart.y,
    flip: false,
  },
  journal: [],
  inventory: [],
  quests: [],
  settings: {
    gamepad: isMobile(),
    debug: false,
    zoomed: isMobile(),
  },
};

export const debugSave: SaveData = {
  player: {
    x: playerStart.x - 200,
    y: playerStart.y,
    flip: false,
  },
  journal: [JournalEntry.FixTheClock, JournalEntry.SphinxRiddleSolved, JournalEntry.MetTheMayor],
  inventory: [
    { type: ItemType.Wrench, used: false },
    { type: ItemType.Gear1, used: false },
  ],
  quests: [
    { id: QuestType.ForestGear, completed: true },
    { id: QuestType.SphinxRiddle, completed: true },
  ],
  settings: {
    gamepad: false,
    debug: false,
    zoomed: true,
  },
};

// Get the current state of the game before saving
export function getCurrentSaveState(scene: Game): SaveData {
  const save: SaveData = {
    player: {
      x: scene.player.x,
      y: scene.player.y,
      flip: scene.player.flipX,
    },
    journal: scene.player.journal.journal,
    inventory: scene.player.inventory.inventory,
    quests: scene.player.quests.quests,
    settings: {
      gamepad: scene.gamepad.visible,
      debug: Config.debug,
      zoomed: Config.zoomed,
    },
  };

  return save;
}

// Get the saved data from local storage, default back to defaultSave if none exists or error parsing
function getSavedData(): { save: SaveData; error: unknown } {
  const data = localStorage.getItem(saveKey);
  let parsed: SaveData | undefined = undefined;
  let error;
  try {
    if (data) parsed = JSON.parse(data);
  } catch (err) {
    console.error(err);
    error = err;
  }

  return { save: parsed || defaultSave, error };
}

function checkConfig(savedata: SaveData, scene: Game): boolean {
  // Load all new config values, then check each and optionally restart to apply
  const originalConfig = { ...Config };
  Config.debug = savedata.settings.debug;
  Config.zoomed = savedata.settings.zoomed;

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

// Only load the config to check if the scene needs to be restarted
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
  const { save: savedata, error } = getSavedData();
  if (error) {
    new Notification(scene, 'Unfortunately, it looks like this save is corrupted.\nFailed to Load Game', 10000);
  }

  try {
    checkConfig(savedata, scene);

    scene.player.setX(savedata.player.x);
    scene.player.setY(savedata.player.y);
    scene.player.setFlipX(savedata.player.flip);

    savedata.journal.forEach((entry) => scene.player.journal.addEntry(entry, true));
    savedata.inventory.forEach((item) => scene.player.inventory.addItem(item, true));
    savedata.quests.forEach((quest) => scene.player.quests.addQuest(quest, true));

    scene.gamepad.setVisible(savedata.settings.gamepad);

    const loadType = deepEqual(savedata, defaultSave)
      ? '[New]'
      : deepEqual(savedata, debugSave)
        ? '[Debug]'
        : '[Storage]';

    scene.time.delayedCall(150, () => new Notification(scene, `Game Loaded ${import.meta.env.DEV ? loadType : ''}`));

    // If new game, save now
    if (deepEqual(savedata, defaultSave)) {
      save(scene);
    }
  } catch (err) {
    console.error(err);
    new Notification(scene, 'Unfortunately, it looks like this save is corrupted.\nFailed to Load Game', 10000);

    save(scene, defaultSave);
    load(scene);
  }
}

export function save(scene: Game, override?: SaveData): void {
  const save = getCurrentSaveState(scene);
  localStorage.setItem(saveKey, JSON.stringify(override || save));

  new Notification(scene, 'Game Saved');
}
