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

let prod = import.meta.env.PROD;
// If local storage exists, always use that value instead
const localProd = localStorage.getItem('chrono-sleuth-prod');
if (localProd !== null) prod = localProd === 'true';

// prod = true;

// Dialog to show after booting game (assets are loaded)
let bootDialog;
// bootDialog = 'DebugTool';

let useShader = prod;
useShader = true;

// TODO: Remove width/height overrides since they are always loaded
const { width, height } = zoomedSize;

// TODO: Remove overrides long-term
if (prod) {
  debug = false;
  fastMode = false;
  prod = true;
  bootDialog = undefined;
}

export const Config = {
  debug,
  prod,
  bootDialog,
  useShader,

  width,
  height,
  cameraOffset: height / 3,
  zoomed: true,

  dayMinutes: 0.25,
  rewindEnabled,

  fastMode,
};
