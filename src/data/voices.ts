import { NPCType } from './types';

export type Voice = {
  octave: number;
  speed: number;
  type?: OscillatorType;
};

export const DefaultVoice: Voice = {
  octave: 3.5,
  speed: 1,
  type: 'sine',
};

export const VoiceData: Record<NPCType | string, Voice> = {
  [NPCType.Inventor]: {
    octave: 3.5,
    speed: 1,
  },
  [NPCType.Stranger]: {
    octave: 3.5,
    speed: 1,
  },
  [NPCType.Sphinx]: {
    octave: 3.5,
    speed: 1,
  },
  [NPCType.Mayor]: {
    octave: 3.9,
    speed: 0.8,
  },
  [NPCType.ClockTower]: {
    octave: 3.5,
    speed: 1,
  },
  player: {
    octave: 3.5,
    speed: 1,
  },
};
