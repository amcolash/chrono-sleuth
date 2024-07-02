import { Scene } from 'phaser';

export class GameOver extends Scene {
  score: number = 0;

  constructor() {
    super('GameOver');
  }

  init(data: { score: number }) {
    this.score = data.score;
  }

  create() {
    const width = this.game.config.width as number;
    const height = this.game.config.height as number;

    this.add.text(width / 2, 300, 'Game Over!', { fontSize: 96 }).setOrigin(0.5);
    this.add.text(width / 2, height - 100, `Score: ${Math.floor(this.score)}`, { fontSize: 36 }).setOrigin(0.5);

    const restart = this.add
      .text(width / 2, 450, 'Restart', { fontSize: 48, backgroundColor: '#05a', padding: { x: 20, y: 20 } })
      .setOrigin(0.5);

    // Button interactions
    restart.setInteractive();
    restart.on('pointerdown', () => this.scene.start('Game'));
    restart.on('pointerover', () => restart.setBackgroundColor('#06e'));
    restart.on('pointerout', () => restart.setBackgroundColor('#05a'));

    // Keyboard interactions
    this.input.keyboard?.on('keydown', () => this.scene.start('Game'));
  }
}
