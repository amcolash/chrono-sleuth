import { GameObjects, Physics, Scene } from 'phaser';

import { Item } from '../classes/Environment/Item';
import { NPC } from '../classes/Environment/NPC';
import { Warp } from '../classes/Environment/Warp';
import { NPCData } from '../data/npc';
import { ItemType, JournalEntry, NPCType, Quest, QuestType, WallType, WarpType } from '../data/types';
import { WallData } from '../data/wall';
import { Game } from '../scenes/Game';

export function updateSphinx(scene: Scene, complete?: boolean, instant?: boolean) {
  const sphinx = getNPC(scene, NPCType.Sphinx);
  if (!sphinx) {
    console.error('Sphinx not found');
    return;
  }

  const wall = getWall(scene, WallType.Sphinx);
  if (wall) {
    if (complete) {
      wall.setX(WallData.find((data) => data.id === WallType.Sphinx)?.x || 0);
    } else {
      wall.setX(wall.x - 150);
    }
    (wall.body as Physics.Arcade.Body)?.updateFromGameObject();
  }

  const { x, y } = NPCData[NPCType.Sphinx];
  const newX = complete ? x + 200 : x;
  const newY = complete ? y - 90 : y;

  scene.tweens.add({
    targets: sphinx,
    alpha: 0,
    duration: !complete || instant ? 0 : 300,
    ease: 'Power1',
    yoyo: true,
    repeat: 0,
    onYoyo: () => {
      sphinx.setPosition(newX, newY);
    },
    onComplete: () => {
      sphinx.alpha = 1;
    },
  });

  scene.tweens.add({
    targets: sphinx.light,
    x: newX,
    y: newY,
    duration: !complete || instant ? 0 : 450,
    ease: 'Power1',
  });
}

export function hasItem(inventory: ItemType[], item: ItemType): boolean {
  return inventory.includes(item);
}

export function hasActiveQuest(quests: Quest[], questId: QuestType): boolean {
  return quests.some((quest) => quest.id === questId && !quest.completed);
}

export function hasCompletedQuest(quests: Quest[], questId: QuestType): boolean {
  return quests.some((quest) => quest.id === questId && quest.completed);
}

export function hasJournalEntry(journal: JournalEntry[], entry: JournalEntry): boolean {
  return journal.includes(entry);
}

export function getGameObjects<T extends GameObjects.GameObject>(
  scene: Scene,
  classRef: new (...args: any[]) => T
): T[] {
  return scene.children.getAll().filter((child) => child instanceof classRef) as T[];
}

/** In general, this function should NOT be used. It is used by the Journal and Quest systems when warps are unlocked. */
export function updateWarpVisibility(scene: Scene, warpType: WarpType, visible: boolean) {
  const warp = getWarper(scene, warpType);
  if (warp) {
    if (visible) warp.unlocked = true;
    warp.setVisible(visible);
  }
}

export function getWarper(scene: Scene, warp: WarpType): Warp | undefined {
  return getGameObjects<Warp>(scene, Warp).find((n) => n.warpType === warp);
}

export function getWall(scene: Scene, wallType: WallType): GameObjects.Rectangle | undefined {
  return getGameObjects<GameObjects.Rectangle>(scene, GameObjects.Rectangle).find(
    (w) => w.getData('WallType') === wallType
  );
}

export function getNPC(scene: Scene, npcType: NPCType): NPC | undefined {
  return getGameObjects<NPC>(scene, NPC).find((n) => n.npcType === npcType);
}

export function getItem(scene: Scene, item: ItemType): Item | undefined {
  return getGameObjects<Item>(scene, Item).find((n) => n.itemType === item);
}

export function getClockRewind(scene: Game): number {
  const gameScene = scene.scene.get('Game') as Game;
  return gameScene.clock?.rewindCount || 0;
}
