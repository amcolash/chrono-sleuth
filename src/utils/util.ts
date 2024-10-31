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
  if (!player.inventory.initialized || !player.quests.initialized || !player.journal.initialized) return false;
  return PhaserMath.Distance.BetweenPointsSquared(obj, player) < (distance || 1000) ** 2;
}

export function openDialog(scene: Game, dialog: string, opts?: any) {
  scene.gamepad?.setAlpha(0);
  scene.gamepad?.resetButtons();
  scene.scene.pause();
  scene.scene.launch(dialog, { player: scene.player, ...opts });
}

/** Transform enum values to strings (used for stringifying save data), thanks GPT */
export function transformEnumValue(value: any, enumType?: any, enumName?: string): any {
  if (enumType && Object.values(enumType).includes(value)) {
    const enumKey = Object.keys(enumType).find((key) => enumType[key as keyof typeof enumType] === value);
    return `${enumName}.${enumKey}`;
  }
  return value; // Non-enum values are returned as-is
}

export function splitTitleCase(text: string): string {
  return text.replace(/([A-Z]+|[0-9]+)/g, ' $1').trim();
}

// code based on: https://supernapie.com/blog/hiding-the-mouse-in-a-ux-friendly-way/
let cursorTimeout: NodeJS.Timeout;
const page = document.documentElement;

function cursorMoveHandler() {
  page.style.cursor = 'default';
  clearTimeout(cursorTimeout);

  cursorTimeout = setTimeout(() => {
    page.style.cursor = 'none';
  }, 2500);
}

export function setupCursorHiding() {
  page.style.cursor = 'none';
  page.addEventListener('mousemove', cursorMoveHandler);
}
