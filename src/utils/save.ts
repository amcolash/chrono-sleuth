import deepEqual from 'deep-equal';

import { Notification } from '../classes/UI/Notification';
import { Config } from '../config';
import { SaveData, SaveType, saveKey, saves } from '../data/saves';
import { Game } from '../scenes/Game';
import { setZoomed } from './util';

// Get the current state of the game before saving
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

  return { save: parsed || saves[SaveType.New], error };
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

    // Delay loading this data as it can make UI which slows down initial game load
    scene.time.delayedCall(50, () => {
      scene.player.inventory.createUI();
      scene.player.quests.createUI();
      scene.player.journal.createUI();

      savedata.inventory.sort((a, b) => a.type - b.type).forEach((item) => scene.player.inventory.addItem(item, true));

      // Journals are second, quests third. Both have side-effects, but quests always happen last
      savedata.journal.sort().forEach((entry) => scene.player.journal.addEntry(entry, true));
      savedata.quests.sort((a, b) => a.id - b.id).forEach((quest) => scene.player.quests.addQuest(quest, true));

      // Side effects of data are always last
      scene.player.gameState.updateData(savedata.gameState, true);
    });

    scene.gamepad.setVisible(savedata.settings.gamepad);

    const loadType = deepEqual(savedata, saves[SaveType.New]) ? '[New]' : '[Storage]';

    scene.time.delayedCall(200, () => {
      new Notification(scene, `Game Loaded ${import.meta.env.DEV ? loadType : ''}`);
    });

    // If new game, save now
    if (deepEqual(savedata, saves[SaveType.New])) {
      save(scene, undefined, true);
    }
  } catch (err) {
    console.error(err);
    new Notification(scene, 'Unfortunately, it looks like this save is corrupted.\nFailed to Load Game', 10000);

    save(scene, saves[SaveType.New]);
    load(scene);
  }
}

export function save(scene: Game, override?: SaveData, silent?: boolean): void {
  const save = getCurrentSaveState(scene);
  localStorage.setItem(saveKey, JSON.stringify(override || save));

  if (!silent) new Notification(scene, 'Game Saved');
}
