let fastMode = false;
fastMode = true;

let debug = false;
debug = true;

let rewindEnabled = false;
// rewindEnabled = true;

const width = 1024;
const height = 768;

export const Config = {
  debug,
  width,
  height,
  cameraOffset: height / 3,

  dayMinutes: 0.25,
  rewindEnabled,

  fastMode,
};
