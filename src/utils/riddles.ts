import { Scene } from 'phaser';

import { NPC } from '../classes/Environment/NPC';
import { Music } from '../classes/Music';
import { Player } from '../classes/Player/Player';
import { Dialog } from '../data/dialog';
import { PropData } from '../data/prop';
import { NPCType, PropType, QuestType } from '../data/types';
import { Game } from '../scenes/Game';
import { updateAnimation } from './animations';
import { hasActiveQuest } from './interactionUtils';
import { setChromaticAberration } from './shaders/crt';
import { fadeIn, fadeOut } from './util';

export const riddles = [
  {
    question: 'I speak without a mouth and hear without ears. I have no body, but I come alive with the wind.',
    answer: 'echo',
    options: ['echo', 'whisper', 'ghost', 'silence', 'shadow'],
    hints: {
      [NPCType.Inventor]: [
        'The sphinx is known for asking about things we take for granted.',
        'Think about what we hear in canyons.',
      ],
      [NPCType.Stranger]: [
        'The sphinx’s riddles are always a bit tricky.',
        'I think this one is about something that bounces off walls.',
      ],
    },
  },
  {
    question: 'I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?',
    answer: 'map',
    options: ['map', 'essay', 'dream', 'photograph', 'landscape'],
    hints: {
      [NPCType.Inventor]: [
        'Think of something that represents the world, showing cities and mountains but not in a literal way.',
      ],
      [NPCType.Stranger]: [
        'Imagine something that can fit in your hand or hang on a wall, showing vast landscapes and bodies of water, but not in their true form.',
      ],
    },
  },
  {
    question: 'I fly without wings. I cry without eyes. Whenever I go, darkness flies. What am I?',
    answer: 'cloud',
    options: ['cloud', 'bat', 'wind', 'shadow', 'storm'],
    hints: {
      [NPCType.Inventor]: [
        'The sphinx’s riddles can be twisted. Think about things that move or change without the usual parts, like wings or eyes.',
      ],
      [NPCType.Stranger]: [
        'Look at your surroundings. Shadows often behave in strange ways, don’t they?',
        'They move, disappear, and seem to fly without wings.',
      ],
    },
  },
];

function getRiddleIndex(scene: Scene): number {
  // if (scene instanceof Game) return getClockRewind(scene) % riddles.length;

  if (scene instanceof Game) {
    const player = scene.player;
    if (hasActiveQuest(player, QuestType.FindPotionIngredients)) {
      return 1;
    }
  }

  return 0;
}

export const sphinxRiddle = (): Dialog<NPC> => {
  return {
    messages: (player) => getSphinxRiddle(player.scene),
    options: (player) => getSphinxOptions(player.scene),
    onSelected: handleSphinxAnswer,
  };
};

export function getSphinxRiddle(scene: Scene): string[] {
  const index = getRiddleIndex(scene);
  return [riddles[index].question];
}

export function getSphinxOptions(scene: Scene): string[] {
  const index = getRiddleIndex(scene);
  const options = [...riddles[index].options];
  const shuffled = options.sort(() => Math.random() - 0.5);
  shuffled.push('I don’t know');

  return shuffled;
}

export function getSphinxAnswer(scene: Scene): string {
  const index = getRiddleIndex(scene);
  return riddles[index].answer;
}

export function getSphinxHint(scene: Scene, npcType: NPCType.Inventor | NPCType.Stranger): string[] {
  const index = getRiddleIndex(scene);
  return riddles[index].hints[npcType];
}

export function handleSphinxAnswer(option: string, player: Player, npc?: NPC) {
  const answer = getSphinxAnswer(player.scene);
  if (option === answer) {
    player.message.setDialog<NPC>(
      {
        messages: [`That is correct. Well done, you may pass.`],
        onCompleted: (player) => {
          player.quests.updateExistingQuest(QuestType.SphinxRiddle, true);
          player.gameState.updateData({ sphinxMoved: true, sphinxFail: false });
        },
      },
      npc
    );
  } else if (option === 'I don’t know') {
    player.message.setDialog<NPC>({ messages: ['Come back when you have an answer for me.'] }, npc);
  } else {
    // TODO: Add back talking points so we can hide dialog in a different system that is reset
    player.message.setDialog<NPC>(
      {
        messages: ['That is not correct. You will not remember how to get back to me.'],
        onCompleted: (player) => {
          player.gameState.updateData({
            mazeSolved: false,
            mazeSeed: player.gameState.data.mazeSeed + 1,
            sphinxFail: true,
          });

          // tween needs a target, but actual work is done in onUpdate
          const obj = { value: 0 };

          player.active = false;

          player.scene.add
            .timeline([
              {
                at: 0,
                tween: {
                  targets: obj,
                  value: { from: 1, to: 15 },
                  duration: 1000,
                  onUpdate: (tween) => setChromaticAberration(tween.getValue()),
                },
              },
              {
                at: 500,
                run: () => {
                  fadeOut(player.scene, 300);
                  Music.stop();
                },
                sound: 'sphinx_warp',
              },
              {
                at: 3500,
                run: () => {
                  setChromaticAberration(1);

                  const { x, y } = PropData[PropType.Bed];
                  player.setPosition(x, y);
                  player.previousPosition.set(player.x + 1, player.y);
                  updateAnimation(player);

                  fadeIn(player.scene, 2000);
                },
              },
              {
                at: 6500,
                run: () => {
                  player.active = true;

                  player.message.setDialog<Player>(
                    {
                      messages: [
                        'I just had the oddest dream.',
                        'I suppose I should continue investigating the town...',
                      ],
                    },
                    player
                  );
                },
              },
            ])
            .play();
        },
      },
      npc
    );
  }
}
