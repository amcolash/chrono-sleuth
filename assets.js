const { execSync } = require('child_process');
const { readdirSync, mkdirSync, readFileSync, writeFileSync, rmdirSync } = require('fs');
const { join } = require('path');

const assetsDir = 'public/assets';
const tmp = '/tmp/chrono-sleuth-assets';

// Helpers
function exc(command) {
  console.log(`Executing: ${command}`);
  execSync(command, { stdio: 'inherit' });
}

function atlas(inputPath, outputFile) {
  exc(`npx harp-atlas-generator -i "${inputPath}/*.png" -o ${assetsDir}/atlases/${outputFile}`);

  const jsonFile = join(assetsDir, outputFile + '.json');
  const data = JSON.parse(readFileSync(jsonFile).toString());

  const output = {
    frames: Object.entries(data).map((f) => ({
      filename: f[0],
      frame: { x: f[1].x, y: f[1].y, w: f[1].width, h: f[1].height },
    })),
  };

  writeFileSync(jsonFile, JSON.stringify(output, undefined, 2));
}

// Audio
function words() {
  const wordsDir = 'src-assets/audio/words';
  exc(`npx audiosprite -o ${assetsDir}/sounds/words -u sounds/ -e mp3 -g 0 -b 24 -r 24000 ${wordsDir}/*.mp3`);
}

function sfx() {
  const sfxDir = 'src-assets/audio/sfx';
  exc(`npx audiosprite -o ${assetsDir}/sounds/sfx -u sounds/ -e mp3 -g 0.25 -b 24 -r 24000 ${sfxDir}/*.mp3`);
}

// Atlases
function icons() {
  const iconDir = 'src-assets/icons';
  const icons = readdirSync(iconDir);
  const iconsTmp = join(tmp, 'icons');

  rmdirSync(iconsTmp, { recursive: true });
  mkdirSync(iconsTmp, { recursive: true });

  icons.forEach((i) => {
    const icon = join(iconDir, i);
    const output = join(iconsTmp, i.replace('.svg', '.png'));
    exc(`inkscape -w 64 -h 64 ${icon} -o ${output}`);
  });

  atlas(iconsTmp, 'icons');
}

function items() {
  const itemDir = 'src-assets/items';
  atlas(itemDir, 'items');
}

// Main export
function fullExport() {
  words();
  icons();
  sfx();
  items();
}

// fullExport();
items();
