import { GameObjects, Physics, Scene } from 'phaser';

import { Item } from '../classes/Item';
import { NPC, NPCData } from '../classes/NPC';
import { WallData } from '../classes/Walls';
import { Warp } from '../classes/Warp';
import { ItemType, JournalEntry, NPCType, Quest, QuestType, WallType, WarpType } from '../classes/types';
import { Game } from '../scenes/Game';

export function updateSphinx(scene: Scene, complete?: boolean) {
  const sphinx = getNPC(scene, NPCType.Sphinx);

  updateWarpVisibility(scene, WarpType.ForestEast, complete === true);

  const wall = getWall(scene, WallType.Sphinx);
  if (wall) {
    if (complete) {
      wall.setX(WallData.find((data) => data.id === WallType.Sphinx)?.x || 0);
    } else {
      wall.setX(wall.x - 150);
    }
    (wall.body as Physics.Arcade.Body)?.updateFromGameObject();
  }

  if (!sphinx) return;

  const { x, y } = NPCData[NPCType.Sphinx];
  scene.tweens.add({
    targets: sphinx,
    alpha: 0,
    duration: 300,
    ease: 'Power1',
    yoyo: true,
    repeat: 0,
    onYoyo: () => {
      if (complete) {
        sphinx.setPosition(x + 200, y - 90);
      } else {
        sphinx.setPosition(x, y);
      }
    },
    onComplete: () => {
      sphinx.alpha = 1;
    },
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

export function updateWarpVisibility(scene: Scene, warpType: WarpType, visible: boolean) {
  const warp = getWarper(scene, warpType);
  if (warp) warp.setVisible(visible);
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
  return gameScene.clock.rewindCount || 0;
}
