import { GameObjects, Physics, Scene, Time } from 'phaser';

import { Item } from '../classes/Environment/Item';
import { Prop } from '../classes/Environment/Prop';
import { warpTo } from '../classes/Environment/Warp';
import { Music } from '../classes/Music';
import { Player, playerFirstName } from '../classes/Player/Player';
import { Message } from '../classes/UI/Message';
import { Config } from '../config';
import { Layer } from '../data/layers';
import { PropData } from '../data/prop';
import { ItemType, MusicType, PropType, QuestType, WallType, WarpType } from '../data/types';
import { WallData } from '../data/wall';
import { Game } from '../scenes/Game';
import { rotationCorrection, updateAnimation } from './animations';
import { fontStyle } from './fonts';
import { getProp, getWall, hasItem, hasUsedItem, updateWarpLocked } from './interactionUtils';
import { toggleXRay } from './shaders/xray';
import { fadeIn, fadeOut } from './util';

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
      run: () => {
        player.anims.resume();
        scene.sound.playAudioSprite('sfx', 'ladder', { rate: 0.6 });
      },
    },
    {
      at: 3100,
      run: () => scene.sound.playAudioSprite('sfx', 'ladder', { rate: 0.6 }),
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
      run: () => {
        player.anims.resume();
        scene.sound.playAudioSprite('sfx', 'ladder', { rate: 0.6 });
      },
    },
    {
      at: 3100,
      run: () => scene.sound.playAudioSprite('sfx', 'ladder', { rate: 0.6 }),
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
      run: () => {
        player.anims.resume();
        scene.sound.playAudioSprite('sfx', 'ladder', { rate: 0.6 });
      },
    },
    {
      at: 4100,
      run: () => scene.sound.playAudioSprite('sfx', 'ladder', { rate: 0.6 }),
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
  Music.start(MusicType.Station);

  const train = scene.add.image(800, 1460, 'train').setScale(1.35).setDepth(Layer.Shader);

  // Flip player sprite
  const player = scene.player;
  player.previousPosition.set(player.x + 1, player.y);
  updateAnimation(player);

  player.active = false;

  scene.add
    .timeline([
      {
        at: 200,
        run: () => scene.sound.playAudioSprite('sfx', 'train_whistle', { rate: 0.9, volume: 0.6 }),
      },
      {
        at: 2500,
        tween: { targets: train, x: -500, duration: 5000 },
        run: () => scene.sound.playAudioSprite('sfx', 'train_rolling', { volume: 0.6 }),
      },
      {
        at: 2500,
        tween: { targets: train, y: train.y - 4, loop: -1, yoyo: true, duration: 100 },
      },
      {
        at: 7800,
        run: () => {
          train.destroy();

          const message = player.message;
          message.setDialog(
            {
              messages: [
                'Now that I have arrived in town, I should talk to the townsfolk about the strange occurrences.',
                'Maybe someone has seen something that could help me start my investigation.',
              ],
              onCompleted: (player) => {
                player.active = true;
              },
            },
            player
          );
        },
      },
    ])
    .play();
}

export const sphinxWallOffset = 150;
export function updateSphinxWallAndWarp(scene: Scene, complete?: boolean) {
  const wall = getWall(scene, WallType.Sphinx);
  if (wall) {
    const x = WallData.find((data) => data.id === WallType.Sphinx)?.x || 0;
    wall.setX(x - (complete ? 0 : sphinxWallOffset));
    (wall.body as Physics.Arcade.Body)?.updateFromGameObject();
  }

  updateWarpLocked(scene, WarpType.ForestEast, !complete);
}

export function openChest(player: Player) {
  const scene = player.scene;
  const gear = new Item(scene, ItemType.Gear1, player);
  scene.interactiveObjects.add(gear);

  const chest = getProp(scene, PropType.Chest);
  if (!chest) return;

  player.active = false;

  player.setX(chest.x - 75);
  player.previousPosition.set(player.x - 1, player.y);

  scene.sound.playAudioSprite('sfx', 'chest');
  chest.setFrame('chest_open');

  gear.setPosition(chest.x, chest.y - 20);
  gear.setScale(0.15);

  scene.tweens.add({
    targets: gear,
    scale: 0.35,
    y: chest.y + 20,
    duration: 700,
    onComplete: () => (player.active = true),
    ease: 'Bounce.easeOut',
  });
}

const herbData = {
  [ItemType.HerbRed]: { frame: 'alchemy_red', tint: 0xaa0000, x: -20 },
  [ItemType.HerbGreen]: { frame: 'alchemy_green', tint: 0x00aa00, x: -35 },
  [ItemType.HerbBlue]: { frame: 'alchemy_blue', tint: 0x0000aa, x: -5 },
};

export function addHerb(
  player: Player,
  target: Prop | undefined,
  type: ItemType.HerbRed | ItemType.HerbGreen | ItemType.HerbBlue
) {
  player.inventory.useItem(type);
  player.setActive(false);

  if (!target || !target.particles) return;

  player.scene.sound.playAudioSprite('sfx', 'ingredient');

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
  alchemySet.setFrame('alchemy_empty');

  if (!hasItem(player, ItemType.Potion)) {
    if (hasUsedItem(player, ItemType.HerbBlue)) {
      alchemySet.setFrame(herbData[ItemType.HerbBlue].frame);
    } else if (hasUsedItem(player, ItemType.HerbRed)) {
      alchemySet.setFrame(herbData[ItemType.HerbRed].frame);
    } else if (hasUsedItem(player, ItemType.HerbGreen)) {
      alchemySet.setFrame(herbData[ItemType.HerbGreen].frame);
    }
  }
}

export function makePotion(player: Player, potion?: Prop) {
  const scene = player.scene;

  player.inventory.useItem(ItemType.HerbBlue);
  player.setActive(false);

  fadeOut(scene, 500, () => {
    scene.time.delayedCall(700, () => {
      potion?.setFrame('alchemy_full');
      potion?.particles
        ?.setConfig({ ...PropData[PropType.AlchemySet].particles, tint: [0x660077], x: 30, delay: 350, stopAfter: 120 })
        .start();

      scene.sound.playAudioSprite('sfx', 'potion');

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

              target?.setFrame('alchemy_empty');
              player.setActive(true);
            },
          },
          potion,
          'player_portrait'
        );
      });
    });
  });
}

export function revealSafe(player: Player, silent: boolean) {
  const picture = getProp(player.scene, PropType.MansionPicture);
  const angle = 97;

  if (silent) picture?.setAngle(angle);
  else {
    player.setActive(false);
    picture?.scene.tweens.add({
      targets: picture,
      angle,
      duration: 1500,
      onComplete: () => {
        player.setActive(true);
        player.message.setDialog(
          {
            messages: [
              'A sturdy looking safe was hidden behind the picture.',
              'It looks like it requires a special key to open.',
            ],
          },
          player
        );
      },
    });
  }
}

export function openSafe(player: Player) {
  player.inventory.useItem(ItemType.Potion);

  player.active = false;

  const scene = player.scene;
  const gear = new Item(player.scene, ItemType.Gear2, player);
  scene.interactiveObjects.add(gear);

  const safe = getProp(scene, PropType.MansionPicture);
  if (!safe) return;

  toggleXRay(scene, false);

  scene.sound.playAudioSprite('sfx', 'safe_open');
  gear.setPosition(safe.x, safe.y + 20);

  scene.tweens.add({
    targets: gear,
    x: safe.x - 10,
    y: safe.y + 120,
    duration: 1000,
    hold: 3750,
    onComplete: () => {
      player.message.setDialog(
        {
          messages: [
            'Wow, that was wild.',
            'I should be more careful next time before I drink random potions.',
            'At least I found the gear!',
          ],
          onCompleted: () => scene.time.delayedCall(500, () => (player.active = true)),
        },
        safe,
        'player_portrait'
      );
    },
    ease: 'Bounce.easeOut',
  });
}

export function bedtime(player: Player) {
  Music.stop();
  player.setActive(false);

  player.gameState.updateData({ day: player.gameState.data.day + 1, night: false });

  player.scene.add
    .timeline([
      {
        at: 0,
        run: () =>
          fadeOut(player.scene, 500, () => {
            player.setPosition(2660, player.y);
            player.previousPosition.set(player.x + 1, player.y);
            updateAnimation(player);
          }),
      },
      { at: 1000, run: () => player.scene.sound.playAudioSprite('sfx', 'lullaby', { rate: 0.85, volume: 0.4 }) },
      {
        at: 4000,
        run: () => {
          fadeIn(player.scene, 1000, () => {
            player.message.setDialog(
              {
                messages: ['Ah, what a lovely rest. Time to get back to work!'],
                onCompleted: (player) => player.setActive(true),
              },
              player
            );
          });
        },
      },
    ])
    .play();
}

export async function delay(time: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function timelineDialog(message: Message, timeline: Time.Timeline, messages: string[], target: any) {
  timeline.pause();
  message.setDialog({ messages, onCompleted: () => timeline.resume() }, target);
}

class DialogTimeline {
  scene: Scene;
  message: Message;
  timeline: Time.Timeline;
  onComplete: () => void;

  constructor(scene: Scene, message: Message) {
    this.scene = scene;
    this.message = message;
    this.timeline = scene.add.timeline({});

    scene.input.keyboard?.on('keydown-BACK_SLASH', () => {
      this.timeline.stop();
      this.message.setDialog();
      this.onComplete();
    });
  }

  add(m: string | string[], portrait: string, time: number = 500) {
    const messages: string[] = typeof m === 'string' ? [m] : m;
    this.timeline.add({
      from: time,
      run: () => {
        this.timeline.pause();
        this.message.setDialog({ messages, onCompleted: () => this.timeline.resume() }, undefined, portrait);
      },
    });
  }

  setComplete(fn: () => void) {
    this.onComplete = fn;

    this.timeline.add({
      from: 500,
      run: fn,
    });
  }
}

function initTownMeeting(player: Player) {
  const scene = player.scene;
  player.setActive(false);

  // Add innkeeper, so there is not any complex logic on where he should be positioned
  const innkeeper = scene.add.image(640, 630, 'characters', 'innkeeper').setPipeline('Light2D');

  const villager1 = scene.add.image(480, 635, 'TODO').setDisplaySize(50, 120).setPipeline('Light2D');
  const villager2 = scene.add.image(400, 640, 'TODO').setDisplaySize(50, 120).setPipeline('Light2D');
  const villager3 = scene.add.image(1010, 645, 'TODO').setDisplaySize(50, 120).setPipeline('Light2D');

  const message = player.message;

  // TODO: Get this SFX
  scene.sound.playAudioSprite('sfx', 'town_chatter');

  const dialog = new DialogTimeline(scene, message);

  // Lok back and forth
  dialog.timeline.add({ from: 1800, run: () => (player.previousPosition.x = player.x - 1) });
  dialog.timeline.add({ from: 500, run: () => (player.previousPosition.x = player.x + 1) });
  dialog.timeline.add({ from: 700, run: () => (player.previousPosition.x = player.x - 1) });
  dialog.timeline.add({ from: 500, run: () => (player.previousPosition.x = player.x - 1) });
  dialog.timeline.add({ from: 500, run: () => (player.previousPosition.x = player.x - 1) });

  return { villagers: [innkeeper, villager1, villager2, villager3], dialog };
}

function completeTownMeeting(player: Player, dialog: DialogTimeline, villagers: GameObjects.Image[]) {
  dialog.add('Well, it is getting late. I should head to the inn and turn in for the night.', 'player_portrait', 1500);
  dialog.setComplete(() => {
    fadeOut(player.scene, 250, () => {
      warpTo(WarpType.InnEntrance, WarpType.Inn, player);
      villagers.forEach((v) => v.destroy());
    });
  });

  dialog.timeline.play();
}

export function townMeeting1(player: Player) {
  const { dialog, villagers } = initTownMeeting(player);

  dialog.add(
    'It looks like the town is having a meeting. I should listen in to see if I can learn anything else about the clocktower.',
    'player_portrait',
    1500
  );

  dialog.add(
    [
      "Alright everyone, let's get started with the meeting tonight.",
      `For those unaware, we have a new person joining tonight. ${playerFirstName} has been investigating the clocktower mystery.`,
      'Today, she found a missing gear and installed it back into the clock! Thank you Rosie.',
    ],
    'mayor_portrait',
    2500
  );

  dialog.add(
    'Welcome Rosie! We are thrilled to have you here. Great job on investigating the mystery of the clock tower!',
    'innkeeper_portrait'
  );

  dialog.add(
    "Now, let's get to the main topic of the evening. Has anyone noticed any oddities? Yesterday, the clock stopped and today I heard from Johan that some of his tools were missing.",
    'mayor_portrait'
  );

  dialog.add('TODO MORE DIALOG', 'player_portrait');

  completeTownMeeting(player, dialog, villagers);
}

export function townMeeting2(player: Player) {
  const { dialog, villagers } = initTownMeeting(player);

  dialog.add('TODO MORE DIALOG', 'player_portrait');

  completeTownMeeting(player, dialog, villagers);
}
