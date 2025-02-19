import { Player } from '../classes/Player/Player';
import { Config } from '../config';

export function createAnimation(player: Player) {
  player.anims.create({
    key: 'walk',
    frames: player.anims.generateFrameNumbers('character', { start: 0, end: 5 }),
    repeat: -1,
    frameRate: Config.prod ? 6 : 9,
  });

  player.anims.play('walk');
}

export const rotationCorrection = 5;
export function updateAnimation(player: Player) {
  const diffX = player.x - player.previousPosition.x;
  const moved =
    Math.abs(player.body?.velocity.x || 0) > 1 || Math.abs(player.body?.velocity.y || 0) > 1 || Math.abs(diffX) > 1;

  if (moved) player.anims.resume();
  else player.anims.pause();

  const flipped = diffX < 0;

  if (Math.abs(diffX) > 0) player.flipX = player.rewinding ? !flipped : flipped;
  player.setAngle(player.flipX ? -rotationCorrection : rotationCorrection);
}
