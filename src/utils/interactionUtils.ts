import { GameObjects, Physics, Scene } from 'phaser';

import { NPC, NPCData } from '../classes/NPC';
import { WallData } from '../classes/Walls';
import { Warp } from '../classes/Warp';
import { NPCType, WallType, WarpType } from '../classes/types';
import { Game } from '../scenes/Game';

export function updateSphinx(npc: NPC, complete?: boolean) {
  const scene = npc.scene;
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

  const { x, y } = NPCData[NPCType.Sphinx];
  scene.tweens.add({
    targets: npc,
    alpha: 0,
    duration: 300,
    ease: 'Power1',
    yoyo: true,
    repeat: 0,
    onYoyo: () => {
      if (complete) {
        npc.setPosition(x + 200, y - 90);
      } else {
        npc.setPosition(x, y);
      }
    },
    onComplete: () => {
      npc.alpha = 1;
    },
  });
}

export function updateWarpVisibility(scene: Scene, warp: WarpType, visible: boolean) {
  scene.children.getAll().forEach((child) => {
    if (child instanceof Warp && child.warpType === warp) {
      child.setVisible(visible);
    }
  });
}

export function getWall(scene: Scene, wallType: WallType): GameObjects.Rectangle | undefined {
  const wall = scene.children
    .getAll()
    .find((child) => child instanceof GameObjects.Rectangle && child.getData('WallType') === wallType);
  return wall as GameObjects.Rectangle;
}

export function getClockRewind(scene: Scene): number {
  const gameScene = scene.scene.get('Game') as Game;
  return gameScene?.clock.rewindCount || 0;
}
