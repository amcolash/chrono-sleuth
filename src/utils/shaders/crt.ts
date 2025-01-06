import { Plugins, Renderer } from 'phaser';

import { Config } from '../../config';
import { getSavedData } from '../save';
import crtFragmentShader from './crt.glsl?raw';

export let crtAlpha = 1;

export class CRTPipeline extends Renderer.WebGL.Pipelines.PostFXPipeline {
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

export class PipelinePlugin extends Plugins.ScenePlugin {
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
