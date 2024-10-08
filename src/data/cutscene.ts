import { Physics, Scene } from 'phaser';

import { Item } from '../classes/Environment/Item';
import { Prop } from '../classes/Environment/Prop';
import { Player } from '../classes/Player/Player';
import { getNPC, getProp, getWall, updateWarpVisibility } from '../utils/interactionUtils';
import { fadeIn, fadeOut } from '../utils/util';
import { NPCData } from './npc';
import { PropData } from './prop';
import { ItemType, NPCType, PropType, QuestType, WallType, WarpType } from './types';
import { WallData } from './wall';

export function updateSphinx(scene: Scene, complete?: boolean, instant?: boolean) {
  const sphinx = getNPC(scene, NPCType.Sphinx);
  if (!sphinx) {
    console.error('Sphinx not found');
    return;
  }

  const wall = getWall(scene, WallType.Sphinx);
  if (wall) {
    const x = WallData.find((data) => data.id === WallType.Sphinx)?.x || 0;
    if (complete) {
      wall.setX(x || 0);
    } else {
      wall.setX(x - 150);
    }
    (wall.body as Physics.Arcade.Body)?.updateFromGameObject();
  }

  updateWarpVisibility(scene, WarpType.ForestEast, complete || false);

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
      sphinx.disabled = complete || false;
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
  player.setActive(false);

  fadeOut(scene, 500, () => {
    scene.time.delayedCall(700, () => {
      target?.setTexture('alchemy_full');
      target?.particles
        ?.setConfig({ ...PropData[PropType.AlchemySet].particles, tint: [0x660077], x: 30, delay: 200, stopAfter: 120 })
        .start();

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
              player.setActive(true);
            },
          },
          target,
          'player_portrait'
        );
      });
    });
  });
}

export function revealSafe(player: Player, silent: boolean) {
  const picture = getProp(player.scene, PropType.MansionPicture);

  if (!silent) player.setActive(false);
  picture?.scene.tweens.add({
    targets: picture,
    angle: 97,
    duration: silent ? 0 : 1500,
    onComplete: () => {
      if (!silent) {
        player.setActive(true);
        player.message.setDialog(
          {
            messages: [
              'A sturdy looking safe was hidden behind the picture.',
              'It looks like it requires a special key to open.',
            ],
          },
          undefined,
          'player_portrait'
        );
      }
    },
  });
}

export function openChest(player: Player) {
  const scene = player.scene;
  const gear = new Item(scene, ItemType.Gear1, player);
  scene.interactiveObjects.add(gear);

  const target = getProp(scene, PropType.Chest);
  if (!target) return;

  player.setX(target.x - 100);

  target.setTexture('chest_open');

  target.disabled = true;
  gear.disabled = true;
  gear.setPosition(target.x, target.y - 20);
  gear.setScale(0.15);

  scene.tweens.add({
    targets: gear,
    scale: 0.35,
    y: target.y + 20,
    duration: 700,
    onComplete: () => {
      target.disabled = false;
      gear.disabled = false;
    },
    ease: 'Bounce.easeOut',
  });
}

const herbData = {
  [ItemType.HerbRed]: { texture: 'alchemy_red', tint: 0xaa0000, x: -20 },
  [ItemType.HerbGreen]: { texture: 'alchemy_green', tint: 0x00aa00, x: -35 },
  [ItemType.HerbBlue]: { texture: 'alchemy_blue', tint: 0x0000aa, x: -5 },
};

export function addHerb(
  player: Player,
  target: Prop | undefined,
  type: ItemType.HerbRed | ItemType.HerbGreen | ItemType.HerbBlue
) {
  player.inventory.removeItem(type);
  player.setActive(false);

  if (!target || !target.particles) return;
  target.disabled = true;
  target.setTexture(herbData[type].texture);
  target.particles
    .setConfig({ ...PropData[PropType.AlchemySet].particles, tint: herbData[type].tint, x: herbData[type].x })
    .start()
    .on('complete', () => {
      target.disabled = false;
      player.setActive(true);
    });
}
