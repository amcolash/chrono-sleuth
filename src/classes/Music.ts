import { Scene, Sound, Tweens } from 'phaser';

import { MusicData } from '../data/music';
import { Location, MusicType } from '../data/types';

export const musicFileMapping: Record<MusicType, string> = {
  [MusicType.Station]: 'sounds/music/Unknown.mp3',
  [MusicType.Clock]: 'sounds/music/Night Time Scavenge II.mp3',
  [MusicType.Mansion]: 'sounds/music/Reflective District.mp3',
  [MusicType.Forest]: 'sounds/music/Serene.mp3',
  [MusicType.Intro]: "sounds/music/A New Day's Hurry.mp3",
  [MusicType.Town]: 'sounds/music/A Different Kind Of Journey.mp3',
};

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
    if (this.sound.mute || this.sound.locked) return;
    if (this.music?.key === music && this.music?.isPlaying) return;
    if (this.scene.load.isLoading()) return;

    // console.log('start music:', music, volume, this.scene.load.isLoading());

    /** Disabled for now, consider if this should be done
    if (!this.scene.cache.audio.exists(music)) {
      // console.log('loading music:', music, musicFileMapping[music]);

      this.scene.load.audio(music, musicFileMapping[music]);
      this.scene.load.start();

      return;
    }
    */

    this.stop();
    this.volume = volume || MusicData[music].volume || 0.5;

    this.music = this.sound.get(music) || this.sound.add(music, { loop: true, volume: this.volume });
    fadeInMusic(this.scene, this.music, this.volume);
  }

  stop() {
    if (this.music) fadeOutMusic(this.scene, this.music);
    this.music = undefined;
  }

  setScene(scene: Scene) {
    this.scene = scene;
    this.scene.load.setPath('assets');
  }

  getLocationMusic(location: Location): MusicType | undefined {
    const found = Object.entries(MusicData).find(([_key, value]) => value.locations.includes(location));
    if (found) return found[0] as MusicType;

    return;
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
