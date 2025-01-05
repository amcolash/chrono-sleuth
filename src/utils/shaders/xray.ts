import { Renderer, Scene } from 'phaser';

export let xrayAlpha = 0;

const xrayShader = `
precision mediump float;

uniform float     uAlpha;
uniform sampler2D uMainSampler;

varying vec2 outTexCoord;

void main(void)
{
  vec4 baseColor = vec4(texture2D(uMainSampler, outTexCoord).rgba);
  vec4 newColor = baseColor;
  newColor.g *= 1.25;
  newColor.r *= 2.5;
  newColor.b *= 3.;

  gl_FragColor = mix(baseColor, newColor, uAlpha);
}
`;

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
