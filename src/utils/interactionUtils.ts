import { GameObjects, Physics, Scene } from 'phaser';

import { Item } from '../classes/Environment/Item';
import { NPC } from '../classes/Environment/NPC';
import { Prop } from '../classes/Environment/Prop';
import { Warp } from '../classes/Environment/Warp';
import { InventoryData } from '../classes/Player/Inventory';
import {
  DataProps,
  ItemType,
  JournalEntry,
  NPCType,
  PropType,
  Quest,
  QuestType,
  WallType,
  WarpType,
} from '../data/types';
import { Game } from '../scenes/Game';

export function hasItem(inventory: InventoryData[], item: ItemType): boolean {
  return inventory.find((i) => i.type === item) !== undefined;
}

export function hasUsedItem(inventory: InventoryData[], item: ItemType): boolean {
  return inventory.find((i) => i.type === item && i.used) !== undefined;
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

export function getProp(scene: Scene, prop: PropType): Prop | undefined {
  return getGameObjects<Prop>(scene, Prop).find((n) => n.propType === prop);
}

export function getClockRewind(scene: Game): number {
  const gameScene = scene.scene.get('Game') as Game;
  return gameScene.clock?.rewindCount || 0;
}

export function initializeObject(obj: Physics.Arcade.Image, config: DataProps) {
  const { scale, alpha, angle, depth, skipLighting, origin } = config;

  if (scale) obj.setScale(scale);
  if (alpha) obj.setAlpha(alpha);
  if (angle) obj.setAngle(angle);
  if (depth) obj.setDepth(depth);
  if (!skipLighting) obj.setPipeline('Light2D');
  if (origin) obj.setOrigin(origin.x, origin.y);
}
