import { NPCType } from './types';

export type Voice = {
  octave: number;
  speed: number;
  volume?: number;
  type?: OscillatorType;
};

export const DefaultVoice: Voice = {
  octave: 3.5,
  speed: 1,
  volume: 1,
  type: 'sine',
};

export const VoiceData: Record<NPCType | string, Voice> = {
  [NPCType.Inventor]: {
    octave: 3.3,
    speed: 1,
    volume: 1.8,
  },
  [NPCType.Stranger]: {
    octave: 2.8,
    speed: 1.1,
    volume: 2.6,
  },
  [NPCType.Sphinx]: {
    octave: 2.5,
    speed: 2,
    volume: 2,
    type: 'triangle',
  },
  [NPCType.Mayor]: {
    octave: 3.9,
    speed: 0.8,
    volume: 0.8,
  },
  [NPCType.ClockTower]: {
    octave: 2.1,
    speed: 1.5,
    volume: 1.5,
    type: 'sawtooth',
  },
  player: {
    octave: 3.7,
    speed: 0.75,
    volume: 0.9,
  },
};