import { GameObjects, Scene } from 'phaser';

import { Voice } from '../data/voices';

/**
 * Create typewriter animation for text.
 * Code mostly from: https://dev.to/joelnet/creating-a-typewriter-effect-in-phaserjs-v3-4e66
 */
export function animateText(target: GameObjects.Text, speedInMs: number = 15) {
  // store original text
  const message = target.text;
  const invisibleMessage = message.replace(/[^ ]/g, ' ');

  // clear text on screen
  target.text = '';

  // mutable state for visible text
  let visibleText = '';

  const timer = target.scene.time.addEvent({
    delay: speedInMs,
    loop: true,
  });

  // use a Promise to wait for the animation to complete
  return {
    promise: new Promise<void>((resolve) => {
      timer.callback = () => {
        // if all characters are visible, stop the timer
        if (target.text === message) {
          timer.destroy();
          return resolve();
        }

        // add next character to visible text
        visibleText += message[visibleText.length];

        // right pad with invisibleText
        const invisibleText = invisibleMessage.substring(visibleText.length);

        // update text on screen
        target.text = visibleText + invisibleText;
      };
    }),
    stop: () => {
      timer.destroy();
      target.text = message;
    },
  };
}

export function playMessageAudio(
  text: string,
  voice: Voice,
  gameVolume: number,
  scene: Scene
): { promise: Promise<void>; stop?: () => void } {
  // const { speed, octave, volume, type } = voice;
  if (gameVolume === 0) return { promise: Promise.resolve() };

  scene.sound.unlock();

  const playAudioSequentially = (text: string, scene: Phaser.Scene) => {
    let stopRequested = false;

    const stop = () => {
      stopRequested = true;
    };

    const playAudio = (key: string): Promise<void> => {
      return new Promise((resolve) => {
        const sound = scene.sound.add(key);
        sound.on('complete', () => {
          sound.destroy(); // Clean up after playback
          resolve();
        });
        sound.play({ rate: 3, detune: (voice.octave - 4) * 300 });
      });
    };

    const promise = new Promise<void>(async (resolve) => {
      const words = text.toLowerCase().split(' ');

      // Only play a letter every so often to match with message timing
      const wordSkip = 3;

      for (let i = 0; i < words.length; i += wordSkip) {
        if (stopRequested) break;

        const letter = words[i][0];
        if (letter.charCodeAt(0) >= 97 && letter.charCodeAt(0) <= 122) {
          await playAudio(letter);
        }
      }
      resolve(); // Resolve the promise once all playback is complete
    });

    return { promise, stop };
  };

  return playAudioSequentially(text, scene);
}
