import { GameObjects, Physics } from 'phaser';

import { NPC, NPCData } from '../classes/NPC';
import { WallData } from '../classes/Walls';
import { Warp } from '../classes/Warp';
import { NPCType, WallType, WarpType } from '../classes/types';

export function updateSphinx(npc: NPC, complete?: boolean) {
  const scene = npc.scene;
  scene.children.getAll().forEach((child) => {
    if (child instanceof Warp && child.warpType === WarpType.ForestEast) {
      child.setVisible(complete === true);
    }

    if (child instanceof GameObjects.Rectangle && child.getData('WallType') === WallType.Sphinx) {
      const wall = WallData.find((w) => w.id === WallType.Sphinx);
      if (wall) {
        if (complete) {
          child.setX(wall.x);
        } else {
          child.setX(wall.x - 150);
        }
        (child.body as Physics.Arcade.Body)?.updateFromGameObject();
      }
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
  });
}
