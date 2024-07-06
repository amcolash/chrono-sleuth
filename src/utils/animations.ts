import { Player } from '../classes/Player';

// export function createWalkAnimations(texture: string, scene: Scene, sprite: Phaser.Physics.Arcade.Sprite, frameRate: number = 9) {
//   const anim = scene.anims;

//   if (!createdAnimations.includes(texture)) {
//     anim.create({
//       key: `${texture}-up`,
//       frames: anim.generateFrameNumbers(texture, { start: 0, end: 2 }),
//       frameRate,
//       repeat: -1,
//     });

//     anim.create({
//       key: `${texture}-right`,
//       frames: anim.generateFrameNumbers(texture, { start: 3, end: 5 }),
//       frameRate,
//       repeat: -1,
//     });

//     anim.create({
//       key: `${texture}-down`,
//       frames: anim.generateFrameNumbers(texture, { start: 6, end: 8 }),
//       frameRate,
//       repeat: -1,
//     });

//     anim.create({
//       key: `${texture}-left`,
//       frames: anim.generateFrameNumbers(texture, { start: 9, end: 11 }),
//       frameRate,
//       repeat: -1,
//     });

//     createdAnimations.push(texture);
//   }

//   sprite.anims.play(`${texture}-down`);
// }

// export function updateAnim(texture: string, sprite: Phaser.Physics.Arcade.Sprite) {
//   if (sprite.body) {
//     const velocity = sprite.body.velocity;
//     const normalized = velocity.clone().normalize();

//     const blockedHoriz = sprite.body.blocked.left || sprite.body.blocked.right;
//     const blockedVert = sprite.body.blocked.up || sprite.body.blocked.down;

//     const movingHoriz = Math.abs(velocity.x) > 0 && !blockedHoriz;
//     const movingVert = Math.abs(velocity.y) > 0 && !blockedVert;

//     sprite.anims.timeScale = 1;
//     if (movingHoriz && Math.abs(normalized.x) >= Math.abs(normalized.y)) {
//       sprite.anims.play(velocity.x < 0 ? `${texture}-left` : `${texture}-right`, true);
//     } else if (movingVert) {
//       sprite.anims.play(velocity.y < 0 ? `${texture}-up` : `${texture}-down`, true);
//     } else {
//       sprite.anims.timeScale = 0.25;
//     }

//     if (sprite.scene.physics.world.isPaused) {
//       sprite.anims.pause();
//     }
//   }
// }

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
