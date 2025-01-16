import { Key } from '../classes/UI/InputManager';
import { DataProps, WarpType } from './types';

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

type Data = DataProps & {
  range?: number;
  key: Key.Up | Key.Down | Key.Left | Key.Right;
  direction?: Key.Up | Key.Down | Key.Left | Key.Right;
  warpTo: WarpType;
  visual: WarpVisual;
  sound?: WarpSound;
};

export const WarpData: Record<WarpType, Data> = {
  [WarpType.Town]: {
    x: 300,
    y: 650,
    key: Key.Down,
    warpTo: WarpType.Underground,
    visual: WarpVisual.Ladder,
  },
  [WarpType.Underground]: {
    x: 301,
    y: 875,
    key: Key.Up,
    warpTo: WarpType.Town,
    visual: WarpVisual.Ladder,
  },

  [WarpType.TownEast]: {
    x: 1720,
    y: 650,
    key: Key.Right,
    warpTo: WarpType.Forest,
    visual: WarpVisual.WarpLocked,
  },
  [WarpType.Forest]: {
    x: 2650,
    y: 815,
    key: Key.Left,
    warpTo: WarpType.TownEast,
    visual: WarpVisual.Warp,
  },

  [WarpType.TownNorth]: {
    x: 775,
    y: 650,
    key: Key.Up,
    warpTo: WarpType.ClockSquare,
    visual: WarpVisual.WarpLocked,
  },
  [WarpType.ClockSquare]: {
    x: 560,
    y: -330,
    key: Key.Down,
    warpTo: WarpType.TownNorth,
    visual: WarpVisual.Warp,
  },

  [WarpType.ClockSquareNorth]: {
    x: 930,
    y: -330,
    key: Key.Up,
    warpTo: WarpType.ClockEntrance,
    visual: WarpVisual.WarpLocked,
  },
  [WarpType.ClockEntrance]: {
    x: 690,
    y: -1320,
    range: 15,
    key: Key.Left,
    direction: Key.Down,
    warpTo: WarpType.ClockSquareNorth,
    visual: WarpVisual.Warp,
    skipLighting: true,
  },

  [WarpType.ClockStairs]: {
    x: 910,
    y: -1400,
    range: 20,
    key: Key.Right,
    direction: Key.Up,
    warpTo: WarpType.ClockTop,
    visual: WarpVisual.Invisible,
    sound: WarpSound.Ladder,
  },
  [WarpType.ClockTop]: {
    x: 780,
    y: -1970,
    range: 10,
    key: Key.Left,
    direction: Key.Down,
    warpTo: WarpType.ClockStairs,
    visual: WarpVisual.Invisible,
    sound: WarpSound.Ladder,
  },

  [WarpType.ForestEast]: {
    x: 3590,
    y: 815,
    key: Key.Right,
    warpTo: WarpType.Lake,
    visual: WarpVisual.WarpLocked,
    initializeOnStart: true,
  },
  [WarpType.Lake]: {
    x: 4625,
    y: 915,
    key: Key.Left,
    warpTo: WarpType.ForestEast,
    visual: WarpVisual.Warp,
  },

  [WarpType.TownWest]: {
    x: 90,
    y: 650,
    key: Key.Left,
    warpTo: WarpType.MansionGrounds,
    visual: WarpVisual.WarpLocked,
  },
  [WarpType.MansionGrounds]: {
    x: -620,
    y: 640,
    key: Key.Right,
    warpTo: WarpType.TownWest,
    visual: WarpVisual.Warp,
  },

  [WarpType.MansionEntrance]: {
    x: -1290,
    y: 640,
    key: Key.Up,
    warpTo: WarpType.Mansion,
    visual: WarpVisual.Invisible,
  },
  [WarpType.Mansion]: {
    x: -1405,
    y: -420,
    key: Key.Down,
    warpTo: WarpType.MansionEntrance,
    visual: WarpVisual.Invisible,
  },

  [WarpType.LabHatch]: {
    x: -1920,
    y: 640,
    key: Key.Down,
    warpTo: WarpType.Lab,
    visual: WarpVisual.InvisibleLocked,
  },
  [WarpType.Lab]: {
    x: -1380,
    y: 1545,
    key: Key.Right,
    direction: Key.Up,
    warpTo: WarpType.LabHatch,
    visual: WarpVisual.Invisible,
    range: 15,
    skipLighting: true,
  },

  [WarpType.TownHallEntrance]: {
    x: 1120,
    y: -330,
    key: Key.Right,
    warpTo: WarpType.TownHall,
    visual: WarpVisual.InvisibleLocked,
  },
  [WarpType.TownHall]: {
    x: 1670,
    y: -290,
    key: Key.Left,
    warpTo: WarpType.TownHallEntrance,
    visual: WarpVisual.Warp,
  },

  [WarpType.InnEntrance]: {
    x: 1300,
    y: 650,
    key: Key.Up,
    warpTo: WarpType.Inn,
    visual: WarpVisual.Invisible,
  },
  [WarpType.Inn]: {
    x: 2555,
    y: -1180,
    key: Key.Down,
    warpTo: WarpType.InnEntrance,
    visual: WarpVisual.Invisible,
  },
};
