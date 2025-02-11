const { execSync } = require('child_process');
const { readdirSync, mkdirSync, readFileSync, writeFileSync, rmdirSync } = require('fs');
const { join } = require('path');

const srcDir = 'src-assets';
const assetsDir = 'public/assets';
const tmp = '/tmp/chrono-sleuth-assets';

// Helpers
function exc(command) {
  console.log(`Executing: ${command}`);
  execSync(command, { stdio: 'inherit' });
}

function audioSprite(inputPath, outputFile, opts) {
  const gap = opts?.gap ?? 0.25;

  exc(
    `npx audiosprite -o ${assetsDir}/sounds/${outputFile} -u sounds/ -e mp3 -g ${gap} -b 24 -r 24000 ${inputPath}/**/*.mp3`
  );
}

function generateAtlas(inputPath, outputFile) {
  exc(`npx harp-atlas-generator -i "${inputPath}/**/*.png" -o ${assetsDir}/atlases/${outputFile}`);

  const jsonFile = join(assetsDir, '/atlases/', outputFile + '.json');
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
const audioSprites = ['words', 'sfx'];

function audio() {
  audioSprites.forEach((a) => {
    const outDir = join(srcDir, '/audio/', a);
    audioSprite(outDir, a);
  });
}

// Atlases
function icons() {
  const iconDir = join(srcDir, '/icons');
  const icons = readdirSync(iconDir);
  const iconsTmp = join(tmp, 'icons');

  rmdirSync(iconsTmp, { recursive: true });
  mkdirSync(iconsTmp, { recursive: true });

  icons.forEach((i) => {
    const icon = join(iconDir, i);
    const output = join(iconsTmp, i.replace('.svg', '.png'));
    exc(`inkscape -w 64 -h 64 ${icon} -o ${output}`);
  });

  generateAtlas(iconsTmp, 'icons');
}

const atlases = ['items', 'props', 'characters'];

function atlas() {
  atlases.forEach((a) => {
    const inputDir = join(srcDir, '/', a);
    generateAtlas(inputDir, a);
  });
}

// Main export
function fullExport() {
  audio();
  icons();
  atlas();
}

// fullExport();

generateAtlas(join(srcDir, '/characters'), 'characters');
