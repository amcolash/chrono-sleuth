import { Scene, GameObjects } from 'phaser';
import { Alien } from '../classes/Alien';
import { Walls } from '../classes/Walls';
import { Player } from '../classes/Player';
import { Box } from '../classes/Box';
import { findSuitableLocation } from '../utils/location';

const initialBoxes = 8;

export class Game extends Scene {
  player: Player;
  boxes: GameObjects.Group;
  aliens: GameObjects.Group;
  hammers: GameObjects.Group;
  text: GameObjects.Text;

  gameOver: boolean = false;
  score: number = 0;
  hammerCount: number = 0;

  constructor() {
    super('Game');
  }

  create() {
    const walls = new Walls(this);

    this.player = new Player(this, 32 * 16, 32 * 16);

    const particles = this.add.particles(0, 0, 'tiles', {
      speed: { min: 50, max: 100 },
      scale: { min: 0.35, max: 0.5, end: 0 },
      lifespan: { min: 350, max: 650 },
      rotate: { min: 0, max: 360 },
      color: [0x704040, 0xa02040, 0xc05050],
      alpha: { min: 0.5, max: 0.85, end: 0 },
      radial: true,
      blendMode: 'ADD',
      emitting: false,
    });

    this.aliens = this.add.group([], { runChildUpdate: true });
    this.hammers = this.add.group([], { runChildUpdate: true });
    this.boxes = this.add.group([], { runChildUpdate: true });

    for (let i = 0; i < initialBoxes; i++) {
      const loc = this.findSceneLocation();
      const box = new Box(this, loc.x, loc.y, particles);
      this.boxes.add(box);
    }

    this.gameOver = false;
    this.score = 0;
    this.hammerCount = 0;
    this.text = this.add.text(32, 32, '', { fontSize: 36 });

    this.physics.add.collider(this.aliens, walls);
    this.physics.add.collider(this.aliens, this.boxes);

    this.physics.add.collider(this.player, walls);
    this.physics.add.collider(this.player, this.aliens, () => {
      particles.explode(50, this.player.x, this.player.y);
      this.endGame();
    });
    this.physics.add.collider(this.player, this.boxes, (_, b) => {
      const box = b as Box;
      this.hammerCount = box.onCollide(this.hammerCount);
    });

    this.physics.add.collider(this.player, this.hammers, (_, hammer) => {
      this.hammerCount++;
      hammer.destroy();
    });

    // catch-all to update anything else added to the group
    this.add.group([this.player], { runChildUpdate: true });

    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.pause();
      this.scene.launch('Paused');
    });
  }

  update(time: number, delta: number): void {
    const remainingBoxes = this.boxes.getChildren().filter((box) => !(box as Box).destroyed).length;

    this.text.setText(`Boxes: ${remainingBoxes}\nScore: ${Math.floor(this.score)}\nHammers: ${this.hammerCount}`);

    const alienCount = Math.floor((initialBoxes - remainingBoxes) / 3);
    if (this.aliens.getLength() < alienCount) {
      const loc = this.findSceneLocation();

      const alien = new Alien(this, loc.x, loc.y, this.player);
      this.aliens.add(alien);
    }

    const spawnHammer = Math.random() < (remainingBoxes < initialBoxes ? 0.001 : 0.0005);
    if (spawnHammer) {
      const loc = this.findSceneLocation();

      const hammer = this.physics.add.sprite(loc.x, loc.y, 'hammer');
      this.hammers.add(hammer);
    }

    if (!this.gameOver) this.score += (remainingBoxes * delta) / 2000;
    if (remainingBoxes <= 0 && !this.gameOver) {
      this.endGame();
    }
  }

  endGame() {
    this.gameOver = true;
    this.physics.pause();
    this.time.removeAllEvents();
    this.time.delayedCall(1250, () => this.scene.start('GameOver', { score: this.score }));
  }

  findSceneLocation() {
    return findSuitableLocation([
      ...(this.boxes.getChildren() as GameObjects.Sprite[]),
      ...(this.aliens.getChildren() as GameObjects.Sprite[]),
      ...(this.hammers.getChildren() as GameObjects.Sprite[]),
      this.player,
    ]);
  }
}
