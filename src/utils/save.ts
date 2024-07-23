import deepEqual from 'deep-equal';

import { playerStart } from '../classes/Player';
import { Notification } from '../classes/UI/Notification';
import { Warp } from '../classes/Warp';
import { ItemType, JournalEntry, Quest, QuestType, WarpType } from '../classes/types';
import { Config } from '../config';
import { Game } from '../scenes/Game';
import { getGameObjects } from './interactionUtils';
import { isMobile, setZoomed } from './util';

type WarpList = { warpType: WarpType; state: boolean }[];

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
  inventory: ItemType[];
  quests: Quest[];
  warpers: WarpList;
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
  warpers: [],
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
  inventory: [ItemType.Wrench, ItemType.Gear1],
  quests: [{ id: QuestType.SphinxRiddle, completed: true }],
  warpers: [
    { warpType: WarpType.TownEast, state: true },
    { warpType: WarpType.TownNorth, state: true },
    { warpType: WarpType.ClockSquareNorth, state: true },
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
    warpers: getWarperState(scene),
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

export function load(scene: Game): void {
  const { save: savedata, error } = getSavedData();
  if (error) {
    new Notification(scene, 'Unfortunately, it looks like this save is corrupted.\nFailed to Load Game', 10000);
  }

  try {
    // Load all new config values, then check each and optionally restart to apply
    const originalConfig = { ...Config };
    Config.debug = savedata.settings.debug;
    Config.zoomed = savedata.settings.zoomed;

    if (Config.zoomed !== originalConfig.zoomed) {
      setZoomed(scene, Config.zoomed);
      return;
    }

    if (Config.debug !== originalConfig.debug) {
      scene.scene.restart();
    }

    scene.player.setX(savedata.player.x);
    scene.player.setY(savedata.player.y);
    scene.player.setFlipX(savedata.player.flip);

    savedata.journal.forEach((entry) => scene.player.journal.addEntry(entry, true));
    savedata.inventory.forEach((item) => scene.player.inventory.addItem(item, true));
    savedata.quests.forEach((quest) => scene.player.quests.addQuest(quest, true));

    // TODO: Rethink if this should be more directly tied to journal entries as a side-effect
    setWarperState(scene, savedata.warpers);

    scene.gamepad.setVisible(savedata.settings.gamepad);

    const loadType = deepEqual(savedata, defaultSave)
      ? '[New]'
      : deepEqual(savedata, debugSave)
        ? '[Debug]'
        : '[Storage]';
    new Notification(scene, `Game Loaded ${loadType}`);

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

function getWarperState(scene: Game): WarpList {
  const warpers = getGameObjects<Warp>(scene, Warp);
  return warpers.map((w) => ({ warpType: w.warpType, state: w.visible }));
}

function setWarperState(scene: Game, warpers: WarpList) {
  const gaemWarpers = getGameObjects<Warp>(scene, Warp);
  warpers.forEach((warp) => {
    const found = gaemWarpers.find((w) => w.warpType === warp.warpType);
    if (found) found.setVisible(warp.state);
  });
}
