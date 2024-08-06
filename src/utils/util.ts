import { Cameras, Math as PhaserMath, Scene, Types } from 'phaser';

import { Player } from '../classes/Player/Player';
import { Config, fullSize, zoomedSize } from '../config';
import { Game } from '../scenes/Game';
import { Colors, getColorNumber, getColorObject } from './colors';

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
  // console.log('setZoomed', zoomed);
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

const black = getColorObject(getColorNumber(Colors.Background));

export function fadeIn(scene: Scene, duration: number, callback?: () => void) {
  scene.cameras.main.fadeIn(
    duration,
    black.red,
    black.green,
    black.blue,
    (_camera: Cameras.Scene2D.CameraManager, progress: number) => {
      if (progress >= 1) {
        if (callback) callback();
      }
    }
  );
}

export function fadeOut(scene: Scene, duration: number, callback?: () => void) {
  scene.cameras.main.fadeOut(
    duration,
    black.red,
    black.green,
    black.blue,
    (_camera: Cameras.Scene2D.CameraManager, progress: number) => {
      if (progress >= 1) {
        if (callback) callback();
      }
    }
  );
}

export function shouldInitialize(obj: Types.Math.Vector2Like, player: Player, distance?: number): boolean {
  return PhaserMath.Distance.BetweenPointsSquared(obj, player) < (distance || 1000) ** 2;
}
