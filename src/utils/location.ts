import { GameObjects } from 'phaser';

export function findSuitableLocation(sprites: GameObjects.Sprite[]): { x: number; y: number } {
  const { width, height } = sprites[0].scene.game.config as { width: number; height: number };

  const padding = 96;

  let x: number, y: number;
  do {
    x = Math.random() * width;
    y = Math.random() * height;
  } while (
    sprites.some((sprite) => Phaser.Math.Distance.Between(sprite.x, sprite.y, x, y) < padding) ||
    x < padding ||
    y < padding ||
    x > width - padding ||
    y > height - padding
  );

  return { x, y };
}
