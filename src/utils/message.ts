import { GameObjects, Scene } from 'phaser';
import BBCodeText from 'phaser3-rex-plugins/plugins/bbcodetext';

import { maxMessageLines } from '../classes/UI/Message';
import { Voice } from '../data/voices';
import { fontStyle } from './fonts';

/**
 * Create typewriter animation for text.
 * Code mostly from: https://dev.to/joelnet/creating-a-typewriter-effect-in-phaserjs-v3-4e66
 *
 * Additional code added to handle BBCode tags, as well as yoyo size animation.
 */
export function animateText(
  target: GameObjects.Text | BBCodeText,
  speedInMs: number = 15,
  fontSize: number = fontStyle.fontSize as number
) {
  // store original text
  const message = target.text;

  // clear text on screen
  target.text = '';

  // mutable state for visible text
  let visibleText = '';
  let charIndex = 0;

  const timer = target.scene.time.addEvent({
    delay: speedInMs,
    loop: true,
  });

  // use a Promise to wait for the animation to complete
  return {
    promise: new Promise<void>((resolve) => {
      timer.callback = () => {
        // if all characters are visible, stop the timer
        if (charIndex >= message.length) {
          target.text = message;
          timer.destroy();

          if (target.getWrappedText().length > maxMessageLines) console.error('Message too long!', message);
          return resolve();
        }

        // get next visible text with BBCode handling
        const { visibleText: v, lastLetterIndex } = getVisibleTextWithBBCode(message, charIndex + 1);
        visibleText = v;
        charIndex++;

        // When using BBCode text, exit early once animation completes. Each tag counts as characters, but is automatically closed early.
        if (visibleText.length === message.length) {
          charIndex = message.length;
        }

        // update each letter shown without animation (simple)
        // target.text = visibleText;

        // animate each letter by changing the font size from normal, to large and back to normal size
        animateLetter(target, message, visibleText, lastLetterIndex, fontSize, speedInMs);
      };
    }),
    stop: () => {
      timer.destroy();
      target.text = message;

      if (target.getWrappedText().length > maxMessageLines) console.error('Message too long!', message);
    },
  };
}

function animateLetter(
  target: GameObjects.Text | BBCodeText,
  message: string,
  visibleText: string,
  lastLetterIndex: number,
  fontSize: number,
  speedInMs: number
) {
  let yoyo = false;
  target.scene.tweens.addCounter({
    duration: speedInMs / 2,
    from: fontSize,
    to: fontSize * 1.25,
    yoyo: true,
    onUpdate: (tween) => {
      // on each update, get the current value of the tween and adjust the font size
      const size = tween.getValue();
      const letter = `<size=${size}>${message[lastLetterIndex]}</size>`;

      // update the text with the new letter, ensure that bbcode tags are handled correctly (with last section of text)
      const newMessage =
        visibleText.substring(0, lastLetterIndex) + letter + visibleText.substring(lastLetterIndex + 1);

      target.text = newMessage;
    },
    onYoyo: () => (yoyo = true),
    onComplete: () => {
      // on complete, set the text to the final value w/o bbcode tag
      if (yoyo) target.text = visibleText;
    },
  });
}

function getVisibleTextWithBBCode(message: string, visibleLength: number) {
  let visibleText = '';
  let tagStack = [];
  let charCount = 0;
  let i = 0;
  let lastLetterIndex = 0;

  while (charCount < visibleLength && i < message.length) {
    if (message[i] === '<') {
      // Start of a tag, find the closing bracket
      let endIdx = message.indexOf('>', i);
      if (endIdx !== -1) {
        let tag = message.substring(i, endIdx + 1);
        visibleText += tag;

        // If it's a closing tag, pop the stack
        if (tag.startsWith('</')) {
          tagStack.pop();
        } else if (!tag.endsWith('/>')) {
          // Ignore self-closing tags
          tagStack.push(tag);
        }

        i = endIdx + 1;
        continue;
      }
    }

    // Add normal character
    visibleText += message[i];
    lastLetterIndex = i;

    charCount++;
    i++;
  }

  // Ensure all open tags are properly closed
  for (let j = tagStack.length - 1; j >= 0; j--) {
    let tagName = tagStack[j].match(/\<([^\>=]*)/);
    if (tagName) {
      visibleText += `</${tagName[1]}>`;
    }
  }

  return { visibleText, lastLetterIndex };
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
        const sound = scene.sound.addAudioSprite('words');
        sound.on('complete', () => {
          sound.destroy(); // Clean up after playback
          resolve();
        });
        sound.play(key, { rate: 3, detune: (voice.octave - 4) * 300 });
      });
    };

    const promise = new Promise<void>(async (resolve) => {
      const words = text.toLowerCase().split(' ');

      // Only play a letter every so often to match with message timing
      const wordSkip = 3;

      for (let i = 0; i < words.length; i += wordSkip) {
        if (stopRequested) break;

        const letter = words[i][0];
        const char = letter.charCodeAt(0);
        if (char >= 97 && char <= 122) {
          await playAudio(letter);
        } else {
          // Choose letters for non-alphabetic characters
          await playAudio(String.fromCharCode((char % 25) + 97));
        }
      }
      resolve(); // Resolve the promise once all playback is complete
    });

    return { promise, stop };
  };

  return playAudioSequentially(text, scene);
}
