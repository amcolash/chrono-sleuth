import { Location, MusicType } from './types';

interface Data {
  locations: Location[];
  volume: number;
}

export const MusicData: Record<MusicType, Data> = {
  [MusicType.Intro]: {
    locations: [],
    volume: 0.5,
  },

  [MusicType.Town]: {
    locations: [Location.Town, Location.TownHall, Location.Inn],
    volume: 0.5,
  },

  [MusicType.Clock]: {
    locations: [Location.ClockInner, Location.ClockOutside],
    volume: 0.5,
  },

  [MusicType.Forest]: {
    locations: [Location.Forest, Location.Lake],
    volume: 0.5,
  },

  [MusicType.Mansion]: {
    locations: [Location.MansionInside, Location.MansionOutside, Location.AlchemyLab],
    volume: 0.5,
  },
};
