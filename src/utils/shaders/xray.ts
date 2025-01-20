import { Renderer, Scene } from 'phaser';

import { setChromaticAberration } from './crt';
import xrayShader from './xray.glsl?raw';

export let xrayAlpha = 0;

export class XRayPipeline extends Renderer.WebGL.Pipelines.PostFXPipeline {
  constructor(game: any) {
    super({
      game,
      fragShader: xrayShader,
    });
  }

  onPreRender(): void {
    this.set1f('uAlpha', xrayAlpha);
  }
}

export function toggleXRay(scene: Scene, enabled: boolean, instant: boolean = false) {
  const newXrayAlpha = enabled ? 0.85 : 0;

  if (xrayAlpha === newXrayAlpha) return;

  if (instant) {
    xrayAlpha = newXrayAlpha;
    return;
  }

  scene.sound.play('xray', { rate: 0.85 });

  scene.tweens.addCounter({
    from: xrayAlpha,
    to: enabled ? 0.85 : 0,
    onUpdate: (tween) => (xrayAlpha = tween.getValue()),
    duration: enabled ? 2500 : 1500,
    ease: enabled ? 'Bounce' : undefined,
  });

  scene.tweens.addCounter({
    from: 1,
    to: 15,
    onUpdate: (tween) => setChromaticAberration(tween.getValue()),
    ease: 'Bounce',
    duration: 1000,
    yoyo: true,
  });
}
