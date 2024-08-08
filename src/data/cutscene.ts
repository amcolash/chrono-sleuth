import { Physics, Scene } from 'phaser';

import { Prop } from '../classes/Environment/Prop';
import { Player } from '../classes/Player/Player';
import { getNPC, getWall } from '../utils/interactionUtils';
import { fadeIn, fadeOut } from '../utils/util';
import { NPCData } from './npc';
import { PropData } from './prop';
import { ItemType, NPCType, PropType, QuestType, WallType } from './types';
import { WallData } from './wall';

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

export function makePotion(player: Player, target?: Prop) {
  const scene = player.scene;

  player.inventory.removeItem(ItemType.HerbBlue);
  player.active = false;

  fadeOut(scene, 500, () => {
    scene.time.delayedCall(700, () => {
      target?.setTexture('alchemy_full');
      target?.particles?.setConfig({ ...PropData[PropType.AlchemySet].particles, tint: [0x660077], x: 30 }).start();

      fadeIn(scene, 1500, () => {
        player.message.setDialog<Prop>(
          {
            messages: [
              'I have created the potion mentioned in the old journal.',
              'I should bring it to the mysterious stranger to see if they know how to use it.',
            ],
            onCompleted: (player, target) => {
              player.inventory.addItem({ type: ItemType.Potion, used: false });
              player.quests.updateExistingQuest(QuestType.ExploreLab, true);

              target?.setTexture('alchemy_empty');
              player.active = true;
            },
          },
          target,
          'player_portrait'
        );
      });
    });
  });
}
