let fastMode = false;
fastMode = true;

let debug = false;
// debug = true;

let rewindEnabled = false;
// rewindEnabled = true;

const width = 1024;
const height = 768;

if (import.meta.env.PROD) {
  fastMode = false;
  debug = false;
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
