import { Scene, GameObjects } from 'phaser';
import { Player } from '../classes/Player';
import { Colors } from '../utils/colors';
import { Stairs } from '../classes/Stairs';

export class Game extends Scene {
  player: Player;
  text: GameObjects.Text;
  stairs: GameObjects.Group;
  clock: number;

  constructor() {
    super('Game');
    this.clock = 0;
  }

  create() {
    // game objects
    this.add.sprite(0, 0, 'town').setOrigin(0, 0);
    // const walls = new Walls(this);
    this.player = new Player(this, 100, 650);

    const stairs1 = new Stairs(this, 0, this.player);
    const stairs2 = new Stairs(this, 1, this.player);

    this.text = this.add.text(10, 10, '', { font: '16px sans', color: `#${Colors.White}` }).setScrollFactor(0);

    // groups (for automatically updating)

    this.stairs = this.add.group([], { runChildUpdate: true });
    this.stairs.add(stairs1);
    this.stairs.add(stairs2);

    // update items added to the group
    this.add.group([this.player], { runChildUpdate: true });

    // TODO: Figure out how to get this to unset when no collisions. Alternatively, find an event for "un-collide"
    // collisions
    this.physics.add.overlap(
      this.player,
      this.stairs,
      (_, stair) => {
        this.player.setInteractiveObject(stair as Stairs);
      },
      undefined,
      this
    );

    // events
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.pause();
      this.scene.launch('Paused');
    });

    // setup
    this.cameras.main.startFollow(this.player);
  }

  update(time: number, delta: number): void {
    if (!this.physics.overlap(this.player, this.stairs)) {
      this.player.setInteractiveObject(undefined);
    }

    this.clock += delta;
    this.text.setText(`Time: ${Math.floor(this.clock / 1000)}`);
  }
}
