import { GameObjects } from 'phaser';

import { Voice } from '../data/voices';

/**
 * Create typewriter animation for text.
 * Code mostly from: https://dev.to/joelnet/creating-a-typewriter-effect-in-phaserjs-v3-4e66
 * @param {Phaser.GameObjects.Text} target
 * @param {number} [speedInMs=25]
 * @returns {Promise<void>}
 */
export function animateText(target: GameObjects.Text, speedInMs = 15) {
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

function createSeededRandom(seed: number) {
  return function () {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return (seed >>> 0) / 4294967296;
  };
}

function generateSeed(text: string) {
  const str = text;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash); // Ensure a positive seed
}

const NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'] as const;
type Note = (typeof NOTES)[number];
function getPitch(note: Note, octave: number) {
  // ("A", 4) => 440
  // multiply by 2^(1/12) N times to get N steps higher
  var step = NOTES.indexOf(note);
  var power = Math.pow(2, (octave * 12 + step - 57) / 12);
  var pitch = 440 * power;
  return pitch;
}

export function playMessageAudio(
  text: string,
  voice: Voice,
  gameVolume: number
): { promise: Promise<void>; stop?: () => void } {
  const { speed, octave, volume, type } = voice;
  if (gameVolume === 0) return { promise: Promise.resolve() };

  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = type || 'sine';
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  const silent = 0.0000001;

  gainNode.gain.value = silent;
  oscillator.start();

  // Generate a seed based on input parameters
  const seed = generateSeed(text);
  const random = createSeededRandom(seed);

  let time = context.currentTime;
  let index = 0;

  const totalLength = Math.floor((1 / speed) * text.length);

  console.log(text, text.length);

  while (index < totalLength) {
    const startIndex = index;

    // Determine note length (1 to 4 characters)
    const noteLength = 1 + Math.floor(random() * 3);
    index += noteLength;

    // Determine pause length (2 to 17 characters)
    const pauseLength = 2 + Math.floor(random() * 15);
    index += pauseLength;

    const isPunctuation = text.substring(startIndex, index).match(/[,.!?]/);
    const willPlay = index >= totalLength || (random() > 0.05 && !isPunctuation);

    // Calculate durations based on length
    const startDelay = (0.005 + random() * 0.01) * speed;
    const fadeInTime = index === 0 ? 0.05 : 0.005;
    const holdTime = (0.05 + random() * 0.035 * noteLength) * speed;
    const fadeOutTime = index >= totalLength ? 0.2 : 0.005;

    // Randomize frequency
    const frequency = getPitch(NOTES[Math.floor(random() * 12)], octave);
    oscillator.frequency.setValueAtTime(frequency, time + startDelay);

    // Adjust volume based on frequency
    const noteVolume = (willPlay ? 1 : 0) * gameVolume * (0.6 + random() * 0.2) * (volume || 1);

    // Fade in
    gainNode.gain.setValueAtTime(silent, time + startDelay);
    gainNode.gain.linearRampToValueAtTime(noteVolume, time + startDelay + fadeInTime);

    // Hold, then fade out
    gainNode.gain.setValueAtTime(noteVolume, time + startDelay + fadeInTime + holdTime);
    gainNode.gain.linearRampToValueAtTime(silent, time + startDelay + fadeInTime + holdTime + fadeOutTime);

    // Update time for the next note
    time += startDelay + fadeInTime + holdTime + fadeOutTime;

    // Add pause duration
    const pauseDuration = 0.01 * pauseLength * speed; // Adjust as needed
    time += pauseDuration;
  }

  let closed = false;
  const stop = () => {
    if (closed) return;
    closed = true;

    let delayTime = 0;
    if (context.currentTime < time) {
      const fadeTime = 0.25;
      // fade out
      gainNode.gain.cancelScheduledValues(context.currentTime);
      gainNode.gain.linearRampToValueAtTime(silent, context.currentTime + fadeTime);

      delayTime = fadeTime * 1000;
    }

    setTimeout(() => {
      oscillator.stop();
      context.close();
    }, delayTime + 50);
  };

  const promise = new Promise<void>((resolve) => {
    setTimeout(
      () => {
        stop();
        resolve();
      },
      (time - context.currentTime) * 1000
    );
  });

  return { promise, stop };
}

export function generateRandomString() {
  // Define the possible characters for the string
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  // Generate a random length between 50 and 90
  const length = Math.floor(Math.random() * 41) + 50;

  // Start with a basic random string of the chosen length
  let result = Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');

  // Add 1-3 commas at random positions
  const commaCount = Math.floor(Math.random() * 3) + 1;
  for (let i = 0; i < commaCount; i++) {
    const commaPosition = Math.floor(Math.random() * result.length);
    result = result.substring(0, commaPosition) + ',' + result.substring(commaPosition);
  }

  // Add spaces at random positions, making sure they are not at the start or end
  const spaceCount = Math.floor(Math.random() * (length / 10));
  for (let i = 0; i < spaceCount; i++) {
    const spacePosition = Math.floor(Math.random() * (result.length - 2)) + 1;
    result = result.substring(0, spacePosition) + ' ' + result.substring(spacePosition);
  }

  return result;
}
