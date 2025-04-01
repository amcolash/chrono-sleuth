import { Display, GameObjects, Scene } from 'phaser';

import { Config } from '../config';
import { WarpType } from '../data/types';
import { Colors, fromRGB, getColorNumber, tweenColor } from './colors';
import { getWarper } from './interactionUtils';

const duration = 1200;
let currentlyChanging = false;

export function isDaytime(scene: Scene) {
  const current = fromRGB(scene.lights.ambientColor);
  return current === getColorNumber(Colors.White);
}

export function isNighttime(scene: Scene) {
  const current = fromRGB(scene.lights.ambientColor);
  return current === getColorNumber(Colors.Night);
}

export function toggleLighting(scene: Scene) {
  if (isDaytime(scene)) {
    setNighttime(scene);
  } else {
    setDaytime(scene);
  }
}

export function setDaytime(scene: Scene, tween: boolean = true) {
  if (currentlyChanging) return;
  fadeAmbient(scene, Colors.White, tween);

  if (tween) {
    scene.time.delayedCall(duration, () => updateDebugLights(scene, 0.5));
  } else {
    updateDebugLights(scene, 0.5);
  }

  // On transition to day, slowly fade them off
  scene.lights.lights.forEach((light) => {
    const originalIntensity = light.intensity;
    if (tween) {
      scene.tweens.add({
        targets: light,
        duration,
        intensity: 0,
        onComplete: () => {
          light.setVisible(false);
          light.setIntensity(originalIntensity);
        },
      });
    } else {
      light.setVisible(false);
    }
  });

  const townWarp = getWarper(scene, WarpType.TownNorth);
  townWarp?.updateLocked(false);
}

export function setNighttime(scene: Scene, tween: boolean = true) {
  if (currentlyChanging) return;
  fadeAmbient(scene, Colors.Night, tween);

  updateDebugLights(scene, 1);

  // On transition to night, turn off lights and slowly fade them on
  scene.lights.lights.forEach((light) => {
    const originalIntensity = light.intensity;
    light.setVisible(true);

    if (tween) {
      light.setIntensity(0);
      scene.tweens.add({
        targets: light,
        duration,
        intensity: originalIntensity,
      });
    }
  });

  const townWarp = getWarper(scene, WarpType.TownNorth);
  if (!Config.debug) townWarp?.updateLocked(true);
}

export function fadeAmbient(scene: Scene, target: string, tween: boolean) {
  if (!tween) {
    scene.lights.setAmbientColor(getColorNumber(target));
    return;
  }

  currentlyChanging = true;

  const current = fromRGB(scene.lights.ambientColor);

  const startColor = Display.Color.ValueToColor(current);
  const endColor = Display.Color.ValueToColor(target);

  tweenColor(scene, startColor, endColor, (color) => scene.lights.setAmbientColor(color), {
    duration,
    onComplete: () => {
      currentlyChanging = false;
    },
  });
}

function updateDebugLights(scene: Scene, value: number) {
  const debugGraphics = scene.children.getAll('name', 'DebugLightGraphics') as GameObjects.Graphics[];
  debugGraphics.forEach((g) => g.setAlpha(value));
}
