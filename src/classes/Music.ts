import { Scene, Sound, Tweens } from 'phaser';

import { MusicData } from '../data/music';
import { MusicType } from '../data/types';

export let Music: MusicManager;
export function createMusicInstance(sound: Sound.BaseSoundManager) {
  Music = new MusicManager(sound);
}

class MusicManager {
  sound: Sound.BaseSoundManager;
  music?: Sound.BaseSound;
  volume = 0.5;

  scene: Scene;

  constructor(sound: Sound.BaseSoundManager) {
    this.sound = sound;

    sound.on('mute', (_soundManager: unknown, muted: boolean) => {
      if (this.music) {
        if (muted) fadeOutMusic(this.scene, this.music);
        else fadeInMusic(this.scene, this.music, this.volume);
      }
    });

    sound.once('unlocked', () => {
      if (this.music && !this.music.isPlaying) {
        fadeInMusic(this.scene, this.music, this.volume);
      }
    });
  }

  start(music: MusicType, volume?: number) {
    if (this.music?.key === music && this.music?.isPlaying) return;

    this.stop();
    this.volume = volume || MusicData[music].volume || 0.5;

    this.music = this.sound.get(music) || this.sound.add(music, { loop: true, volume: this.volume });
    if (!this.sound.mute && !this.sound.locked) {
      fadeInMusic(this.scene, this.music, this.volume);
    }
  }

  stop() {
    if (this.music) fadeOutMusic(this.scene, this.music);
    this.music = undefined;
  }

  setScene(scene: Scene) {
    this.scene = scene;
  }
}

function fadeInMusic(
  scene: Scene | undefined,
  sound: Phaser.Sound.BaseSound,
  volume: number = 0.5,
  duration: number = 500
) {
  if (!scene) return;

  if (sound && !sound.pendingRemove) {
    sound.play({ volume: 0, loop: true });
    scene.tweens.getTweensOf(sound).forEach((tween: Tweens.Tween) => tween.stop());
    scene.tweens.add({
      targets: sound,
      volume,
      duration,
    });
  }
}

function fadeOutMusic(scene: Scene | undefined, sound: Phaser.Sound.BaseSound, duration: number = 500) {
  if (scene && sound.isPlaying) {
    scene.tweens.getTweensOf(sound).forEach((tween: Tweens.Tween) => tween.stop());
    scene.tweens.add({
      targets: sound,
      volume: 0,
      duration,
      onComplete: () => sound.stop(),
    });
  } else {
    sound.stop();
  }
}
