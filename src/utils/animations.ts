import { Player } from '../classes/Player/Player';
import { Config } from '../config';

export function createAnimation(player: Player) {
  const duration = 1000 / (Config.prod ? 6 : 9);

  const frames = player.anims.generateFrameNumbers('character', { start: 0, end: 5 });
  frames.forEach((frame) => (frame.duration = duration));

  player.anims.create({
    key: 'walk',
    frames,
    repeat: -1,
  });

  player.anims.play('walk');
}

export const rotationCorrection = 5;
export function updateAnimation(player: Player) {
  const diffX = player.x - player.previousPosition.x;
  const diffY = player.y - player.previousPosition.y;

  const moved = Math.abs(diffX) > 0.01 || Math.abs(diffY) > 0.01;
  const flipped = diffX < 0;

  if (moved) player.anims.resume();
  else player.anims.pause();

  if (Math.abs(diffX) > 0) player.flipX = player.rewinding ? !flipped : flipped;
  player.setAngle(player.flipX ? -rotationCorrection : rotationCorrection);
}
