import { NPCType } from '../classes/types';
import { getClockRewind } from './interactionUtils';

export const riddles = [
  {
    question: 'I speak without a mouth and hear without ears. I have no body, but I come alive with the wind.',
    answer: 'echo',
    options: ['echo', 'whisper', 'ghost', 'silence', 'shadow'],
    hints: {
      [NPCType.Inventor]:
        'The sphinx is known for asking about things we take for granted. Think about how what hear in canyons.',
      [NPCType.Stranger]:
        'The sphinx’s riddles are always a bit tricky. I think this one is about something that bounces off walls.',
    },
  },
  {
    question: 'I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?',
    answer: 'map',
    options: ['map', 'globe', 'dream', 'photograph', 'landscape'],
    hints: {
      [NPCType.Inventor]:
        'Think of something that represents the world, showing cities and mountains but not in a literal way.',
      [NPCType.Stranger]:
        'Imagine something that can fit in your hand or hang on a wall, showing vast landscapes and bodies of water, but not in their true form.',
    },
  },
  {
    question: 'I fly without wings. I cry without eyes. Whenever I go, darkness flies. What am I?',
    answer: 'cloud',
    options: ['cloud', 'bat', 'wind', 'shadow', 'storm'],
    hints: {
      [NPCType.Inventor]:
        'The sphinx’s riddles can be tricky. Think about things that move or change without the usual parts, like wings or eyes.',
      [NPCType.Stranger]:
        'Look at your surroundings. Shadows often behave in strange ways, don’t they? They move, disappear, and seem to fly without wings.',
    },
  },
];

function getRiddleIndex(scene: Phaser.Scene): number {
  return getClockRewind(scene) % riddles.length;
}

export function getSphinxRiddle(scene: Phaser.Scene): string[] {
  const index = getRiddleIndex(scene);
  return [riddles[index].question];
}

export function getSphinxOptions(scene: Phaser.Scene): string[] {
  const index = getRiddleIndex(scene);
  return riddles[index].options;
}

export function getSphinxAnswer(scene: Phaser.Scene): string {
  const index = getRiddleIndex(scene);
  return riddles[index].answer;
}

export function getSphinxHint(scene: Phaser.Scene, npcType: NPCType.Inventor | NPCType.Stranger): string[] {
  const index = getRiddleIndex(scene);
  const riddle = riddles[index];
  const hint = riddle.hints[npcType];

  return [hint];
}
