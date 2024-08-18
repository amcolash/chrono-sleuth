import { Display, Scene } from 'phaser';

import { Colors, fromRGB, getColorNumber } from './colors';
import { tweenColor } from './util';

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
}

export function setNighttime(scene: Scene, tween: boolean = true) {
  if (currentlyChanging) return;
  fadeAmbient(scene, Colors.Night, tween);

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
