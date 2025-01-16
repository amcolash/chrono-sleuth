import { Types } from 'phaser';

import { HelperTextType } from './types';

type Data = {
  x: number;
  y: number;
  size: Types.Math.Vector2Like;
  text: string;
};

export const HelperTextData: Record<HelperTextType, Data> = {
  [HelperTextType.LabStairs]: {
    x: -1670,
    y: 1730,
    size: {
      x: 80,
      y: 80,
    },
    text: 'Press [UP] to go upstairs',
  },
  [HelperTextType.InnStairs]: {
    x: 2000,
    y: -1205,
    size: {
      x: 80,
      y: 80,
    },
    text: 'Press [UP] to go upstairs',
  },
};
