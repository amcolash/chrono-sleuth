import { Cameras, Display, GameObjects, Math as PhaserMath, Scene, Tweens, Types } from 'phaser';

import { Player } from '../classes/Player/Player';
import { Config, fullSize, zoomedSize } from '../config';
import { Game } from '../scenes/Game';
import { Colors, colorToNumber, getColorNumber, getColorObject } from './colors';

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
  if (!player.inventory.initialized || !player.quests.initialized || !player.journal.initialized) return false;
  return PhaserMath.Distance.BetweenPointsSquared(obj, player) < (distance || 1000) ** 2;
}

export function openDialog(scene: Game, dialog: string, opts?: any) {
  scene.gamepad?.setAlpha(0);
  scene.gamepad?.resetButtons();
  scene.scene.pause();
  scene.scene.launch(dialog, { player: scene.player, ...opts });
}

export function tweenColor(
  scene: Scene,
  start: Display.Color,
  end: Display.Color,
  onChange: (color: number) => void,
  config: Types.Tweens.NumberTweenBuilderConfig
): Tweens.Tween {
  const frames = (config.duration || 100) * 0.3;

  return scene.tweens.addCounter({
    from: 0,
    to: frames,
    onUpdate: (tween) => {
      const tweenedColor = Display.Color.Interpolate.ColorWithColor(start, end, frames, tween.getValue());
      onChange(colorToNumber(tweenedColor));
    },
    ...config,
  });
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
  page.addEventListener('mousemove', cursorMoveHandler);
}

/**
 * Create typewriter animation for text.
 * Code mostly from: https://dev.to/joelnet/creating-a-typewriter-effect-in-phaserjs-v3-4e66
 * @param {Phaser.GameObjects.Text} target
 * @param {number} [speedInMs=25]
 * @returns {Promise<void>}
 */
export function animateText(target: GameObjects.Text, speedInMs = 15) {
  // store original text
  const message = target.text;
  const invisibleMessage = message.replace(/[^ ]/g, ' ');

  // clear text on screen
  target.text = '';

  // mutable state for visible text
  let visibleText = '';

  const timer = target.scene.time.addEvent({
    delay: speedInMs,
    loop: true,
  });

  // use a Promise to wait for the animation to complete
  return {
    promise: new Promise<void>((resolve) => {
      timer.callback = () => {
        // if all characters are visible, stop the timer
        if (target.text === message) {
          timer.destroy();
          return resolve();
        }

        // add next character to visible text
        visibleText += message[visibleText.length];

        // right pad with invisibleText
        const invisibleText = invisibleMessage.substring(visibleText.length);

        // update text on screen
        target.text = visibleText + invisibleText;
      };
    }),
    skip: () => {
      timer.destroy();
      target.text = message;
    },
  };
}
