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
  const camera = scene.cameras.main;

  // Check if a fade effect exists and the screen is already fully visible
  if (camera.fadeEffect && camera.fadeEffect.progress === 1 && camera.fadeEffect.direction === false) {
    // If already fully faded out, just schedule the callback
    if (callback) scene.time.delayedCall(duration, () => callback());

    return;
  }

  camera.fadeIn(
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
  const camera = scene.cameras.main;

  // Check if a fade effect exists and the screen is already fully black
  if (camera.fadeEffect && camera.fadeEffect.progress === 1 && camera.fadeEffect.direction === true) {
    // If already fully faded out, just schedule the callback
    if (callback) scene.time.delayedCall(duration, () => callback());

    return;
  }

  camera.fadeOut(
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

export function nearby(obj1: Types.Math.Vector2Like, obj2: Types.Math.Vector2Like, distance: number): boolean {
  return PhaserMath.Distance.BetweenPointsSquared(obj1, obj2) < distance * distance;
}

export function gameInitialized(player: Player): boolean {
  return (
    player.inventory.initialized &&
    player.quests.initialized &&
    player.journal.initialized &&
    player.gameState.initialized
  );
}

export function shouldInitialize(obj: Types.Math.Vector2Like, player: Player, distance?: number): boolean {
  if (!gameInitialized(player)) return false;
  return nearby(obj, player, distance || 1000);
}

export function openDialog(scene: Game, dialog: string, opts?: any) {
  scene.player.message.setDialog();
  scene.player.message.setVisible(false);

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
  return text
    .replace(/([A-Z]+|[0-9]+)/g, ' $1')
    .replace(/\s*([\(\[\{])\s*/g, ' $1') // remove right-handed space from parentheses and brackets
    .replace(/\s*([\)\]\}])\s*/g, '$1 ') // remove left-handed space from parentheses and brackets
    .replace(/\s+/g, ' ') // remove extra spaces
    .trim();
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

const logTimes: { [key: string]: number } = {};

export function logEvery(key: string, time: number, ...data: any) {
  if (!logTimes[key] || Date.now() - logTimes[key] > time) {
    console.log(key, ...data);
    logTimes[key] = Date.now();
  }
}

export function generateCosTable(size: number): number[] {
  const cosTable = [];
  for (let i = 0; i < size; i++) {
    cosTable.push(Math.cos((i / size) * Math.PI * 2));
  }
  return cosTable;
}

const cosTable = generateCosTable(256);
export function fastCos(angle: number): number {
  const index = Math.floor(((angle % (Math.PI * 2)) / (Math.PI * 2)) * cosTable.length);
  return cosTable[index];
}

function randomGibberishWord(length = 5) {
  const consonants = 'bcdfghjklmnpqrstvwxyz';
  const vowels = 'aeiou';
  let word = '';
  for (let i = 0; i < length; i++) {
    word +=
      i % 2 === 0
        ? consonants[Math.floor(Math.random() * consonants.length)]
        : vowels[Math.floor(Math.random() * vowels.length)];
  }
  return word;
}

export function randomGibberishSentence(wordCount = 5) {
  return Array.from({ length: wordCount }, () => randomGibberishWord()).join(' ') + '.';
}

export function unlockCamera(player: Player) {
  const camera = player.scene.cameras.main;
  camera.stopFollow();
  camera.removeBounds();
  player.unlockCamera = true;
}

export function lockCamera(player: Player) {
  const camera = player.scene.cameras.main;
  camera.startFollow(player, true);
  camera.setFollowOffset(0, Config.cameraOffset);
  player.unlockCamera = false;
}
