import { Scene } from 'phaser';

import { Config } from '../config';
import { getSavedData } from './save';

export let crtAlpha = 1;

const crtFragmentShader = `
precision mediump float;

uniform float     uAlpha;
uniform sampler2D uMainSampler;

varying vec2 outTexCoord;

// slight modifications made to original shader
// use alpha channel for fragColor + changed uniform names

// original shader from: https://www.shadertoy.com/view/WsVSzV
// tips for chromatic aberration: https://lettier.github.io/3d-game-shaders-for-beginners/chromatic-aberration.html

float warp = 0.35;     // simulate curvature of CRT monitor (larger number = more curvature)
float scan = 0.75;    // simulate darkness between scanlines
float scanSize = 0.75; // size of scanlines [0.0 - 2.0] (smaller number = taller scanlines)

float chromaticAberration = 0.25 * uAlpha;
float redOffset   =  0.006 * chromaticAberration;
float greenOffset =  0.003 * chromaticAberration;
float blueOffset  = -0.003 * chromaticAberration;

void mainImage(out vec4 fragColor,in vec2 fragCoord)
{
  if (uAlpha <= 0.0) {
    fragColor = texture2D(uMainSampler, outTexCoord);
    return;
  }

  // squared distance from center
  vec2 uv = outTexCoord;
  vec2 dc = abs(0.5-uv);
  dc *= dc;

  // warp the fragment coordinates
  uv.x -= 0.5; uv.x *= 1.0+(dc.y*(0.3*warp)); uv.x += 0.5;
  uv.y -= 0.5; uv.y *= 1.0+(dc.x*(0.4*warp)); uv.y += 0.5;

  vec2 chromaticOffset = vec2((abs(0.5-uv) + 0.5) * 2.);

  vec4 color;
  color.r = texture2D(uMainSampler,uv + vec2(redOffset * chromaticOffset)).r;
  color.g = texture2D(uMainSampler,uv + vec2(greenOffset * chromaticOffset)).g;
  color.b = texture2D(uMainSampler,uv + vec2(blueOffset * chromaticOffset)).b;
  color.a = texture2D(uMainSampler,uv).a;

  // sample inside boundaries, otherwise set to black
  if (uv.y > 1.0 || uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0) {
      fragColor = vec4(0.0);
  } else {
    // determine if we are drawing in a scanline
    float apply = abs(sin(fragCoord.y * scanSize)*0.5*scan);

    apply = uAlpha * apply;

    // sample the texture
    fragColor = vec4(mix(color.rgb,vec3(0.0), apply), color.a);
  }
}

void main(void)
{
  mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;

export class CRTPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  constructor(game: any) {
    super({
      game,
      renderTarget: true,
      fragShader: crtFragmentShader,
    });
  }

  onPreRender(): void {
    this.set1f('uAlpha', crtAlpha);
  }
}

export class PipelinePlugin extends Phaser.Plugins.ScenePlugin {
  boot() {
    this.systems?.events.on('start', this.applyPipeline, this);

    const { save: savedata } = getSavedData();
    toggleCrt(savedata.settings.useShader);
  }

  applyPipeline() {
    this.scene?.cameras.main.setPostPipeline('CRTPipeline');

    // Prevent 1 frame issue where the shader doesn't apply
    const pipeline = this.scene?.cameras.main.getPostPipeline(CRTPipeline) as CRTPipeline;
    pipeline.bootFX();
  }
}

export function toggleCrt(enabled?: boolean) {
  if (enabled !== undefined) Config.useShader = enabled;
  else Config.useShader = !Config.useShader;

  crtAlpha = Config.useShader ? 1 : 0;
}

/******************************************************************************/

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

export class XRayPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
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
    duration: 2500,
    ease: 'Bounce',
  });
}
