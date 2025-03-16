import { GameObjects, Physics, Scene } from 'phaser';

import { Item } from '../classes/Environment/Item';
import { NPC } from '../classes/Environment/NPC';
import { Prop } from '../classes/Environment/Prop';
import { Warp } from '../classes/Environment/Warp';
import { Player } from '../classes/Player/Player';
import {
  DataProps,
  ItemType,
  JournalEntry,
  LazyInitialize,
  NPCType,
  PropType,
  QuestType,
  WallType,
  WarpType,
} from '../data/types';
import { Game } from '../scenes/Game';

export function hasItem(player: Player, item: ItemType): boolean {
  return player.inventory.inventory.find((i) => i.type === item) !== undefined;
}

export function hasUnusedItem(player: Player, item: ItemType): boolean {
  return player.inventory.inventory.find((i) => i.type === item && !i.used) !== undefined;
}

export function hasUsedItem(player: Player, item: ItemType): boolean {
  return player.inventory.inventory.find((i) => i.type === item && i.used) !== undefined;
}

export function hasQuest(player: Player, questId: QuestType): boolean {
  return player.quests.quests.some((quest) => quest.id === questId);
}

export function hasActiveQuest(player: Player, questId: QuestType): boolean {
  return player.quests.quests.some((quest) => quest.id === questId && !quest.completed);
}

export function hasCompletedQuest(player: Player, questId: QuestType): boolean {
  return player.quests.quests.some((quest) => quest.id === questId && quest.completed);
}

export function hasJournalEntry(player: Player, entry: JournalEntry): boolean {
  return player.journal.journal.includes(entry);
}

export function getGameObjects<T extends GameObjects.GameObject>(
  scene: Scene,
  classRef: new (...args: any[]) => T
): T[] {
  return scene.children.getAll().filter((child) => child instanceof classRef) as T[];
}

/** In general, this function should NOT be used. It is used by the Journal and Quest systems when warps are unlocked. */
export function updateWarpLocked(scene: Scene, warpType: WarpType, locked: boolean) {
  const warp = getWarper(scene, warpType);
  if (warp) {
    warp.updateLocked(locked);
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

export function initializeObject<T>(obj: Physics.Arcade.Image & LazyInitialize, config: DataProps<T>) {
  const { scale, alpha, angle, depth, skipLighting, origin } = config;

  if (scale) {
    if (typeof scale === 'object') obj.setScale(scale.x, scale.y);
    else obj.setScale(scale);
  }

  if (alpha) obj.setAlpha(alpha);
  if (angle) obj.setAngle(angle);
  if (depth) obj.setDepth(depth);
  if (origin) obj.setOrigin(origin.x, origin.y);

  if (!skipLighting) obj.setPipeline('Light2D');
  obj.setPostPipeline('XRayPipeline');
}
