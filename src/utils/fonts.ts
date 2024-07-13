import { Colors } from './colors';

// From https://stackoverflow.com/a/63731801/2303432
export function loadFont(name: string, url: string): Promise<void> {
  const newFont = new FontFace(name, `url(${url})`);

  return newFont
    .load()
    .then(function (loaded) {
      document.fonts.add(loaded);
    })
    .catch(function (error) {
      return error;
    });
}

export const fontStyle = {
  fontFamily: 'm5x7, sans-serif',
  fontSize: 48,
  color: `#${Colors.White}`,
};
