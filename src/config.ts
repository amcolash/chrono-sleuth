let debug = false;
// debug = true;

let rewindEnabled = false;
// rewindEnabled = true;

let fastMode = false;
fastMode = true;

const width = 1280;
const height = 720;

if (import.meta.env.PROD) {
  debug = false;
  fastMode = false;
}

export const Config = {
  debug,

  width,
  height,
  cameraOffset: height / 3,

  dayMinutes: 0.25,
  rewindEnabled,

  fastMode,
};
