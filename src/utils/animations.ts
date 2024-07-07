import { Player } from '../classes/Player';

export function createAnimation(player: Player) {
  player.anims.create({
    key: 'walk',
    frames: player.anims.generateFrameNumbers('character', { start: 0, end: 5 }),
    frameRate: 4,
    repeat: -1,
  });

  player.anims.play('walk');
}

export function updateAnimation(player: Player) {
  const v = player.body?.velocity.x || 0;
  const flipped = v < 0;
  if (Math.abs(v) > 0) {
    player.anims.resume();
    player.flipX = player.rewinding ? !flipped : flipped;
  } else player.anims.pause();
}
