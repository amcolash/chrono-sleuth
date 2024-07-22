import deepEqual from 'deep-equal';

import { playerStart } from '../classes/Player';
import { Notification } from '../classes/UI/Notification';
import { Warp } from '../classes/Warp';
import { ItemType, JournalEntry, Quest, QuestType, WarpType } from '../classes/types';
import { Config } from '../config';
import { Game } from '../scenes/Game';
import { getGameObjects } from './interactionUtils';
import { isMobile } from './util';

type WarpList = { warpType: WarpType; state: boolean }[];

// TODO: Add settings
export type Settings = {
  gamepad: boolean;
  debug: boolean;
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
    { warpType: WarpType.ClockSquareNorth, state: true },
  ],
  settings: {
    gamepad: false,
    debug: true,
  },
};

export function load(scene: Game): void {
  let data = localStorage.getItem('save');
  let parsed: SaveData | undefined = undefined;
  try {
    if (data) parsed = JSON.parse(data);
  } catch (err) {
    console.error(err);
    new Notification(scene, 'Unfortunately, it looks like this save is corrupted.\nFailed to Load Game', 10000);
  }

  try {
    const save: SaveData = parsed || defaultSave;

    if (save.settings.debug !== Config.debug) {
      Config.debug = save.settings.debug;
      scene.scene.restart();
      return;
    }

    scene.player.setX(save.player.x);
    scene.player.setY(save.player.y);
    scene.player.setFlipX(save.player.flip);

    save.journal.forEach((entry) => scene.player.journal.addEntry(entry, true));
    save.inventory.forEach((item) => scene.player.inventory.addItem(item, true));
    save.quests.forEach((quest) => scene.player.quests.addQuest(quest, true));

    // TODO: Rethink if this should be more directly tied to journal entries as a side-effect
    setWarperState(scene, save.warpers);

    scene.gamepad.setVisible(save.settings.gamepad);

    const loadType = deepEqual(parsed, defaultSave) ? '[New]' : deepEqual(parsed, debugSave) ? '[Debug]' : '[Storage]';
    new Notification(scene, `Game Loaded ${loadType}`);
  } catch (err) {
    console.error(err);
    new Notification(scene, 'Unfortunately, it looks like this save is corrupted.\nFailed to Load Game', 10000);

    save(scene, defaultSave);
    load(scene);
  }
}

export function save(scene: Game, override?: SaveData): void {
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
    },
  };

  localStorage.setItem('save', JSON.stringify(override || save));

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
