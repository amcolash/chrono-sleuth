const { execSync } = require('child_process');
const { readdirSync, mkdirSync } = require('fs');
const { join } = require('path');

const assetsDir = 'public/assets';

function exc(command) {
  console.log(`Executing: ${command}`);
  execSync(command, { stdio: 'inherit' });
}

function words() {
  const wordsDir = 'src-assets/audio/words';
  exc(`npx audiosprite -o ${assetsDir}/sounds/words -u sounds/ -e mp3 -g 0 -b 24 -r 24000 ${wordsDir}/*.mp3`);
}

function icons() {
  const iconDir = 'src-assets/icons';
  const icons = readdirSync(iconDir);
  const iconsOutput = join(assetsDir, 'icons');
  mkdirSync(iconsOutput, { recursive: true });

  icons.forEach((i) => {
    const icon = join(iconDir, i);
    const output = join(iconsOutput, i.replace('.svg', '.png'));
    exc(`inkscape -w 64 -h 64 ${icon} -o ${output}`);
  });
}

function sfx() {
  const sfxDir = 'src-assets/audio/sfx';
  exc(`npx audiosprite -o ${assetsDir}/sounds/sfx -u sounds/ -e mp3 -g 0.25 -b 24 -r 24000 ${sfxDir}/*.mp3`);
}

// words();
// icons();
// sfx();
