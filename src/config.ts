import { isMobile } from './utils/util';

let debug = false;
// debug = true;

let rewindEnabled = false;
// rewindEnabled = true;

let fastMode = false;
fastMode = true;

let width = 1280;
let height = 720;

let zoomed = false;
// zoomed = true;
if (isMobile() || zoomed) {
  width = 960;
  height = 540;
}

if (import.meta.env.PROD) {
  debug = false;
  fastMode = false;
}

export const Config = {
  debug,

  width,
  height,
  cameraOffset: height / 3,
  zoomed,

  dayMinutes: 0.25,
  rewindEnabled,

  fastMode,
};
