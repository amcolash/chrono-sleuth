import { Types } from 'phaser';

import { Colors } from './colors';

export const fontStyle: Types.GameObjects.Text.TextStyle = {
  fontFamily: 'm6x11, sans-serif',
  fontSize: 24,
  color: `#${Colors.White}`,
};

export const noteStyle: Types.GameObjects.Text.TextStyle = {
  fontFamily: 'notepen, sans-serif',
  color: `#${Colors.Note}`,
  fontSize: 42,
  fontStyle: 'bold',
};
