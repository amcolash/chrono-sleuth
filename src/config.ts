export const fullSize = {
  width: 1280,
  height: 720,
};

export const zoomedSize = {
  width: 960,
  height: 540,
};

let debug = false;
// debug = true;

let rewindEnabled = false;
// rewindEnabled = true;

let fastMode = false;
fastMode = true;

// TODO: Remove width/height overrides since they are always loaded
const { width, height } = fullSize;

if (import.meta.env.PROD) {
  debug = false;
  fastMode = false;
}

export const Config = {
  debug,

  width,
  height,
  cameraOffset: height / 3,
  zoomed: false,

  dayMinutes: 0.25,
  rewindEnabled,

  fastMode,
};
