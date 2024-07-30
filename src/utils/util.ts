import { Config, fullSize, zoomedSize } from '../config';
import { Game } from '../scenes/Game';

export function isMobile() {
  const toMatch = [/Android/i, /webOS/i, /iPhone/i, /iPad/i, /iPod/i, /BlackBerry/i, /Windows Phone/i];

  return toMatch.some((toMatchItem) => {
    return navigator.userAgent.match(toMatchItem);
  });
}

export function expDecay(a: number, b: number, decay: number, delta: number) {
  return b + (a - b) * Math.exp(-delta * decay);
}

export function setZoomed(scene: Game, zoomed: boolean) {
  console.log('setZoomed', zoomed);

  const size = zoomed ? zoomedSize : fullSize;

  Config.zoomed = zoomed;
  Config.width = size.width;
  Config.height = size.height;
  Config.cameraOffset = size.height / 3;

  scene.scale.setGameSize(size.width, size.height);
  scene.scene.restart();
}

export function getRandomElement<T>(array: T[]): T {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}
