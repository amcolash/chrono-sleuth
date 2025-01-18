import { GameObjects, Physics, Scene } from 'phaser';

import { Item } from '../classes/Environment/Item';
import { Prop } from '../classes/Environment/Prop';
import { Player } from '../classes/Player/Player';
import { Message } from '../classes/UI/Message';
import { Config } from '../config';
import { Game } from '../scenes/Game';
import { rotationCorrection } from '../utils/animations';
import { fontStyle } from '../utils/fonts';
import { getNPC, getProp, getWall, hasUsedItem, updateWarpLocked } from '../utils/interactionUtils';
import { toggleXRay } from '../utils/shaders/xray';
import { fadeIn, fadeOut } from '../utils/util';
import { NPCData } from './npc';
import { PropData } from './prop';
import { ItemType, NPCType, PropType, QuestType, WallType, WarpType } from './types';
import { WallData } from './wall';

export function trainIntro(scene: Scene, player: GameObjects.Sprite) {
  const scale = Config.zoomed ? 0.75 : 1;

  const message = new Message(scene);

  const text = scene.add
    .text(Config.width / 2, Config.height / 2, 'Later that day...', { ...fontStyle, fontSize: '42px' })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setAlpha(0);

  player.setAngle(rotationCorrection);

  const timeline3 = scene.add.timeline([
    {
      at: 1500,
      tween: { targets: player, x: 850 * scale, duration: 2500, onComplete: () => player.anims.pause() },
      run: () => player.anims.resume(),
      sound: { key: 'ladder', config: { rate: 0.6 } },
    },
    {
      at: 3100,
      sound: { key: 'ladder', config: { rate: 0.6 } },
    },
    {
      at: 6000,
      run: () => fadeOut(scene, 500),
    },
    {
      at: 7500,
      run: () => {
        // Somewhat silly hack to fade in/out text, since camera had just faded out.
        // Move camera to a completely different area (text is fixed), then fade in camera which fades text
        // Finally fade out camera to fade out text before switching scenes
        const camera = scene.cameras.main;
        camera.stopFollow();
        camera.centerOn(10000, 10000);

        text.setAlpha(1);
        fadeIn(scene, 500);
      },
    },
    {
      at: 10000,
      run: () => fadeOut(scene, 500),
    },
    {
      at: 12000,
      run: () => {
        if (scene.textures.exists('warp')) {
          scene.scene.start('Game');
        } else {
          scene.scene.start('Preloader');
        }
      },
    },
  ]);

  const timeline2 = scene.add.timeline([
    {
      at: 1500,
      tween: {
        targets: player,
        x: 1200 * scale,
        duration: 2500,
        onComplete: () => player.anims.pause(),
      },
      run: () => player.anims.resume(),
      sound: { key: 'ladder', config: { rate: 0.6 } },
    },
    {
      at: 3100,
      sound: { key: 'ladder', config: { rate: 0.6 } },
    },
    {
      at: 5500,
      run: () => {
        player.setFlipX(true);
        player.setAngle(-rotationCorrection);
      },
    },

    {
      at: 6500,
      run: () => {
        message.setDialog(
          {
            messages: [
              'No doubt about it, this will be a strange journey.',
              'Whatever awaits me in this town, it’s certain that nothing will ever be the same again.',
            ],
            onCompleted: () => timeline3.play(),
          },
          undefined,
          'player_portrait'
        );
      },
    },
  ]);

  const timeline1 = scene.add.timeline([
    {
      at: 2500,
      tween: { targets: player, x: 850 * scale, duration: 3000, onComplete: () => player.anims.pause() },
      run: () => player.anims.resume(),
      sound: { key: 'ladder', config: { rate: 0.6 } },
    },
    {
      at: 4100,
      sound: { key: 'ladder', config: { rate: 0.6 } },
    },
    {
      at: 7000,
      run: () => {
        player.setFlipX(true);
        player.setAngle(-rotationCorrection);
      },
    },
    {
      at: 8000,
      run: () => {
        player.setFlipX(false);
        player.setAngle(rotationCorrection);
      },
    },
    {
      at: 9000,
      run: () => {
        message.setDialog(
          {
            messages: [
              'What a beautiful mountain-scape. I almost forgot where I am headed.',
              'It’s been three days since the letter arrived... It has been many years since I last visited that sleepy old town.',
              'Rumors swirl of strange occurrences. People disappearing, clocks that never strike the hour, and a darkness that lingers beneath the surface.',
            ],
            onCompleted: () => timeline2.play(),
          },
          undefined,
          'player_portrait'
        );
      },
    },
  ]);

  timeline1.play();
}

export function townIntro(scene: Game) {
  scene.player.active = false;

  scene.time.delayedCall(1500, () => {
    const message = scene.player.message;
    message.setDialog(
      {
        messages: [
          'Now that I have arrived in town, I should talk to the townsfolk about the strange occurrences.',
          'Maybe someone has seen something that could help me start my investigation.',
        ],
        onCompleted: () => {
          scene.player.active = true;
        },
      },
      undefined,
      'player_portrait'
    );
  });
}

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

  updateWarpLocked(scene, WarpType.ForestEast, !complete);

  const { x, y } = NPCData[NPCType.Sphinx];
  const newX = complete ? x + 200 : x;
  const newY = complete ? y - 90 : y;
  const duration = !complete || instant ? 1 : 200;

  scene.add
    .timeline([
      {
        at: 0,
        tween: {
          targets: sphinx,
          alpha: 0,
          duration,
        },
      },
      { at: duration + 1, tween: { targets: sphinx, alpha: 1, duration }, run: () => sphinx.setPosition(newX, newY) },
    ])
    .play();
}

export function openChest(player: Player) {
  const scene = player.scene;
  const gear = new Item(scene, ItemType.Gear1, player);
  scene.interactiveObjects.add(gear);

  const chest = getProp(scene, PropType.Chest);
  if (!chest) return;

  player.setX(chest.x - 100);

  chest.setTexture('chest_open');

  chest.disabled = true;
  gear.disabled = true;
  gear.setPosition(chest.x, chest.y - 20);
  gear.setScale(0.15);

  scene.tweens.add({
    targets: gear,
    scale: 0.35,
    y: chest.y + 20,
    duration: 700,
    onComplete: () => {
      chest.disabled = false;
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

  updateAlchemySet(player);
  target.disabled = true;
  target.particles
    .setConfig({ ...PropData[PropType.AlchemySet].particles, tint: herbData[type].tint, x: herbData[type].x })
    .start()
    .on('complete', () => {
      target.disabled = false;
      player.setActive(true);
    });
}

export function updateAlchemySet(player: Player) {
  const alchemySet = getProp(player.scene, PropType.AlchemySet);
  if (!alchemySet) return;
  alchemySet.setTexture('alchemy_empty');

  if (hasUsedItem(player, ItemType.HerbBlue)) {
    alchemySet.setTexture(herbData[ItemType.HerbBlue].texture);
  } else if (hasUsedItem(player, ItemType.HerbRed)) {
    alchemySet.setTexture(herbData[ItemType.HerbRed].texture);
  } else if (hasUsedItem(player, ItemType.HerbGreen)) {
    alchemySet.setTexture(herbData[ItemType.HerbGreen].texture);
  }
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

export function openSafe(player: Player) {
  player.inventory.removeItem(ItemType.Potion);

  const scene = player.scene;
  const gear = new Item(player.scene, ItemType.Gear2, player);
  scene.interactiveObjects.add(gear);

  const safe = getProp(scene, PropType.MansionPicture);
  if (!safe) return;

  gear.disabled = true;
  gear.setPosition(safe.x, safe.y + 20);

  scene.tweens.add({
    targets: gear,
    x: safe.x - 10,
    y: safe.y + 120,
    duration: 1000,
    onComplete: () => {
      player.message.setDialog(
        {
          messages: ['Wow, that was a trip', 'I should be more careful next time', 'At least I found the gear!'],
          onCompleted: () => {
            toggleXRay(scene, false);
            scene.time.delayedCall(1000, () => (gear.disabled = false));
          },
        },
        safe,
        'player_portrait'
      );
    },
    ease: 'Bounce.easeOut',
  });
}
