import { Warp } from '../classes/Environment/Warp';
import { Key } from '../classes/UI/InputManager';
import { DataProps, Location, WarpType } from './types';

export enum WarpVisual {
  /** Show a ladder, instead of standard warp */
  Ladder,

  /** Default warp visual with particles */
  Warp,

  /** Warp is visually never shown (ex: for a door) */
  Invisible,

  /** Warp is locked, but later visually shown */
  WarpLocked,

  /** Warp is locked, but never visually shown */
  InvisibleLocked,
}

export enum WarpSound {
  Warp = 'warp',
  Ladder = 'ladder',
  Door = 'door',
}

type Data = DataProps<Warp> & {
  location: Location;
  range?: number;
  key: Key.Up | Key.Down | Key.Left | Key.Right;
  direction?: Key.Up | Key.Down | Key.Left | Key.Right;
  warpTo: WarpType;
  visual: WarpVisual;
  sound?: WarpSound;
};

export const WarpData: Record<WarpType, Data> = {
  [WarpType.Town]: {
    x: 280,
    y: 650,
    key: Key.Down,
    warpTo: WarpType.Station,
    location: Location.Station,
    visual: WarpVisual.Invisible,
    sound: WarpSound.Ladder,
  },
  [WarpType.Station]: {
    x: 365,
    y: 1355,
    key: Key.Left,
    direction: Key.Up,
    warpTo: WarpType.Town,
    location: Location.Town,
    visual: WarpVisual.Invisible,
    sound: WarpSound.Ladder,
  },

  [WarpType.TownEast]: {
    x: 1720,
    y: 650,
    key: Key.Right,
    warpTo: WarpType.Forest,
    location: Location.Forest,
    visual: WarpVisual.WarpLocked,
  },
  [WarpType.Forest]: {
    x: 2650,
    y: 815,
    key: Key.Left,
    warpTo: WarpType.TownEast,
    location: Location.Town,
    visual: WarpVisual.Warp,
  },

  [WarpType.TownNorth]: {
    x: 775,
    y: 650,
    key: Key.Up,
    warpTo: WarpType.ClockSquare,
    location: Location.ClockOutside,
    visual: WarpVisual.WarpLocked,
  },
  [WarpType.ClockSquare]: {
    x: 560,
    y: -330,
    key: Key.Down,
    warpTo: WarpType.TownNorth,
    location: Location.Town,
    visual: WarpVisual.Warp,
  },

  [WarpType.ClockSquareNorth]: {
    x: 930,
    y: -330,
    key: Key.Up,
    warpTo: WarpType.ClockEntrance,
    location: Location.ClockInner,
    visual: WarpVisual.WarpLocked,
  },
  [WarpType.ClockEntrance]: {
    x: 690,
    y: -1320,
    range: 15,
    key: Key.Left,
    direction: Key.Down,
    warpTo: WarpType.ClockSquareNorth,
    location: Location.ClockOutside,
    visual: WarpVisual.Warp,
    skipLighting: true,
  },

  [WarpType.ClockStairs]: {
    x: 910,
    y: -1418,
    range: 20,
    key: Key.Right,
    direction: Key.Up,
    warpTo: WarpType.ClockTop,
    location: Location.ClockInner,
    name: 'Clock Tower (Upstairs)',
    visual: WarpVisual.Invisible,
    sound: WarpSound.Ladder,
  },
  [WarpType.ClockTop]: {
    x: 780,
    y: -1980,
    range: 10,
    key: Key.Left,
    direction: Key.Down,
    warpTo: WarpType.ClockStairs,
    location: Location.ClockInner,
    name: 'Clock Tower (Downstairs)',
    visual: WarpVisual.Invisible,
    sound: WarpSound.Ladder,
  },

  [WarpType.ForestEast]: {
    x: 3570,
    y: 815,
    key: Key.Right,
    warpTo: WarpType.Lake,
    location: Location.Lake,
    visual: WarpVisual.WarpLocked,
    initializeOnStart: true,
  },
  [WarpType.Lake]: {
    x: 4510,
    y: 915,
    key: Key.Left,
    warpTo: WarpType.ForestEast,
    location: Location.Forest,
    visual: WarpVisual.Warp,
  },

  [WarpType.TownWest]: {
    x: 90,
    y: 650,
    key: Key.Left,
    warpTo: WarpType.MansionGrounds,
    location: Location.MansionOutside,
    visual: WarpVisual.WarpLocked,
  },
  [WarpType.MansionGrounds]: {
    x: -620,
    y: 640,
    key: Key.Right,
    warpTo: WarpType.TownWest,
    location: Location.Town,
    visual: WarpVisual.Warp,
  },

  [WarpType.MansionEntrance]: {
    x: -1290,
    y: 640,
    key: Key.Up,
    warpTo: WarpType.Mansion,
    location: Location.MansionInside,
    visual: WarpVisual.Invisible,
  },
  [WarpType.Mansion]: {
    x: -1405,
    y: -420,
    key: Key.Down,
    warpTo: WarpType.MansionEntrance,
    location: Location.MansionOutside,
    visual: WarpVisual.Invisible,
  },

  [WarpType.LabHatch]: {
    x: -1920,
    y: 640,
    key: Key.Down,
    warpTo: WarpType.Lab,
    location: Location.AlchemyLab,
    visual: WarpVisual.InvisibleLocked,
  },
  [WarpType.Lab]: {
    x: -1380,
    y: 1545,
    key: Key.Right,
    direction: Key.Up,
    warpTo: WarpType.LabHatch,
    location: Location.MansionOutside,
    visual: WarpVisual.Invisible,
    range: 15,
    skipLighting: true,
  },

  [WarpType.LibraryEntrance]: {
    x: 1130,
    y: -330,
    key: Key.Up,
    warpTo: WarpType.Library,
    location: Location.Library,
    visual: WarpVisual.Invisible,
  },
  [WarpType.Library]: {
    x: 1680,
    y: -290,
    key: Key.Down,
    warpTo: WarpType.LibraryEntrance,
    location: Location.ClockOutside,
    visual: WarpVisual.Invisible,
  },

  [WarpType.TownHallEntrance]: {
    x: 2990,
    y: -290,
    key: Key.Down,
    warpTo: WarpType.TownHall,
    location: Location.TownHall,
    visual: WarpVisual.Invisible,
  },

  [WarpType.TownHall]: {
    x: 3560,
    y: -290,
    key: Key.Down,
    warpTo: WarpType.TownHallEntrance,
    location: Location.Library,
    visual: WarpVisual.Invisible,
  },

  [WarpType.InnEntrance]: {
    x: 1300,
    y: 650,
    key: Key.Up,
    warpTo: WarpType.Inn,
    location: Location.Inn,
    visual: WarpVisual.Invisible,
  },
  [WarpType.Inn]: {
    x: 2555,
    y: -1180,
    key: Key.Down,
    warpTo: WarpType.InnEntrance,
    location: Location.Town,
    visual: WarpVisual.Invisible,
  },
};
