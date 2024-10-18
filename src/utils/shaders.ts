import { Renderer, Scene } from 'phaser';

import { Config } from '../config';

const crtFragmentShader = `
precision mediump float;

uniform float     uAlpha;
uniform vec2      uResolution;
uniform sampler2D uMainSampler;

// slight modifications made to original shader
// use alpha channel for fragColor + changed uniform names

// original shader from: https://www.shadertoy.com/view/WsVSzV

float warp = 0.3;     // simulate curvature of CRT monitor
float scan = 0.75;    // simulate darkness between scanlines
float scanSize = 0.75; // size of scanlines [0.0 - 2.0] (smaller number = taller scanlines)

void mainImage(out vec4 fragColor,in vec2 fragCoord)
{
  // squared distance from center
  vec2 uv = fragCoord/uResolution.xy;
  vec2 dc = abs(0.5-uv);
  dc *= dc;

  // warp the fragment coordinates
  uv.x -= 0.5; uv.x *= 1.0+(dc.y*(0.3*warp)); uv.x += 0.5;
  uv.y -= 0.5; uv.y *= 1.0+(dc.x*(0.4*warp)); uv.y += 0.5;

  // sample inside boundaries, otherwise set to black
  if (uv.y > 1.0 || uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0) {
      fragColor = vec4(0.0,0.0,0.0,0.0);
  } else {
    // determine if we are drawing in a scanline
    float apply = abs(sin(fragCoord.y * scanSize)*0.5*scan);

    apply = uAlpha * apply;

    // sample the texture
    float alpha = texture2D(uMainSampler,uv).a;
    fragColor = vec4(mix(texture2D(uMainSampler,uv).rgb,vec3(0.0), apply), alpha);
  }
}

void main(void)
{
  mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;

export class CRTPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  alpha: number;

  constructor(game: any) {
    super({
      game,
      renderTarget: true,
      fragShader: crtFragmentShader,
    });

    this.alpha = 1;
  }

  onDraw(target: Renderer.WebGL.RenderTarget) {
    this.set1f('uAlpha', this.alpha);
    this.bindAndDraw(target);
  }
}

export class PipelinePlugin extends Phaser.Plugins.ScenePlugin {
  boot() {
    if (Config.useShader) this.systems?.events.on('create', this.applyPipeline, this);
  }

  applyPipeline() {
    this.scene?.cameras.main.setPostPipeline('CRTPipeline');
  }
}

export function setCRTAlpha(scene: Scene, alpha: number) {
  const pipeline = scene.cameras.main.getPostPipeline(CRTPipeline) as CRTPipeline;
  if (pipeline) pipeline.alpha = alpha;
}

/******************************************************************************/

const xrayShader = `
precision mediump float;

uniform float     uAlpha;
uniform vec2      uResolution;
uniform sampler2D uMainSampler;

void main(void)
{
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec4 baseColor = vec4(texture2D(uMainSampler, uv).rgba);
  vec4 newColor = baseColor;
  newColor.r *= 5.5;
  newColor.b *= 4.5;

  gl_FragColor = mix(baseColor, newColor, uAlpha);
}
`;

export class XRayPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  alpha: number;

  constructor(game: any) {
    super({
      game,
      fragShader: xrayShader,
    });

    this.alpha = 0;
  }

  onDraw(target: Renderer.WebGL.RenderTarget) {
    this.set1f('uAlpha', this.alpha);
    this.bindAndDraw(target);
  }
}

export function setXRayAlpha(scene: Scene, alpha: number) {
  const pipeline = scene.cameras.main.getPostPipeline(XRayPipeline) as XRayPipeline;
  if (pipeline) pipeline.alpha = alpha;
}
