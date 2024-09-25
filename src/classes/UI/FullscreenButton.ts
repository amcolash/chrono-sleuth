import { Scene } from 'phaser';

import { IconButton } from './IconButton';

export class FullscreenButton extends IconButton {
  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, scene.scale.isFullscreen ? 'minimize' : 'maximize', () => {
      if (scene.scale.isFullscreen) {
        scene.scale.stopFullscreen();
      } else {
        scene.scale.startFullscreen();
      }
    });

    scene.scale.on(Phaser.Scale.Events.ENTER_FULLSCREEN, () => {
      // For some very weird reason, it seems like the scene is sometimes not the same as the scene that the button was created in
      this.img.scene = scene;

      this.img.setTexture('minimize');
    });

    scene.scale.on(Phaser.Scale.Events.LEAVE_FULLSCREEN, () => {
      // For some very weird reason, it seems like the scene is sometimes not the same as the scene that the button was created in
      this.img.scene = scene;

      this.img.setTexture('maximize');
    });
  }
}
