const { execSync } = require('child_process');
const { readdirSync, mkdirSync, readFileSync, writeFileSync, rmdirSync, renameSync, mkdir, existsSync } = require('fs');
const { join, dirname } = require('path');
const sharp = require('sharp');

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

async function generateAtlas(inputPath, outputFile) {
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

  // reduce texture quality to improve size
  const texture = join(assetsDir, '/atlases/', outputFile + '.png');
  await sharp(texture)
    .png({ quality: 10, compressionLevel: 9 })
    .toFile(texture + '1');

  renameSync(texture + '1', texture);
}

// Audio
const audioSprites = [{ name: 'words', opts: { gap: 0 } }, { name: 'sfx' }];

function audio() {
  audioSprites.forEach((a) => {
    const outDir = join(srcDir, '/audio/', a.name);
    audioSprite(outDir, a.name, a.opts);
  });
}

// Atlases
async function icons() {
  const iconDir = join(srcDir, '/icons');
  const icons = readdirSync(iconDir);
  const iconsTmp = join(tmp, 'icons');

  if (existsSync(iconsTmp)) rmdirSync(iconsTmp, { recursive: true });
  mkdirSync(iconsTmp, { recursive: true });

  icons.forEach((i) => {
    const icon = join(iconDir, i);
    const output = join(iconsTmp, i.replace('.svg', '.png'));
    exc(`inkscape -w 64 -h 64 ${icon} -o ${output}`);
  });

  await generateAtlas(iconsTmp, 'icons');
}

async function maps() {
  const inputDir = join(srcDir, '/maps');
  const outputDir = join(assetsDir, '/maps');

  const maps = readdirSync(inputDir, { recursive: true }).map((f) => f.toString());

  if (existsSync(outputDir)) rmdirSync(outputDir, { recursive: true });
  mkdirSync(outputDir, { recursive: true });

  for (const map of maps) {
    const mapFile = join(inputDir, map);
    const output = join(outputDir, map.replace('.jpg', '.png'));

    mkdirSync(dirname(output), { recursive: true });

    if (map.endsWith('.jpg') || map.endsWith('.png')) {
      console.log(output);

      const image = sharp(mapFile);
      const dims = await image.metadata();

      const size = Math.max(300, Math.floor(Math.min((dims.width || 1000) / 2, (dims.height || 1000) / 2)));

      console.log({ width: dims.width, height: dims.height, size, ratio: Math.min(dims.width, dims.height) / size });

      await image
        .resize({ width: size, height: size, fit: 'outside', kernel: 'nearest' })
        .png({ quality: 10, compressionLevel: 9 })
        .toFile(output);
    }
  }
}

const atlases = ['items', 'props', 'characters'];

async function atlas() {
  for (const a of atlases) {
    const inputDir = join(srcDir, '/', a);
    await generateAtlas(inputDir, a);
  }
}

// Main export
async function fullExport() {
  audio();

  await icons();
  await atlas();
  await maps();
}

fullExport();
// generateAtlas(join(srcDir, '/items'), 'items');
// maps();
