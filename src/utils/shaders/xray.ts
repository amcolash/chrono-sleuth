import { Renderer, Scene } from 'phaser';

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

export function toggleXRay(scene: Scene, enabled: boolean) {
  const newValue = enabled ? 0.85 : 0;
  if (xrayAlpha === newValue) return;

  scene.tweens.addCounter({
    from: xrayAlpha,
    to: enabled ? 0.85 : 0,
    onUpdate: (tween) => {
      xrayAlpha = tween.getValue();
    },
    duration: enabled ? 2500 : 1500,
    ease: enabled ? 'Bounce' : undefined,
  });
}
