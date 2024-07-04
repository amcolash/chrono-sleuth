import { Player } from '../classes/Player';
import { Colors } from '../utils/colors';
import { Stairs } from '../classes/Stairs';
import { Rewindable } from '../classes/types.';
import { NPC } from '../classes/NPC';
import { GameObjects, Input, Scene } from 'phaser';
import { Config } from '../config';

export const gameTime = 1000 * 60 * 5;
export const rewindInterval = 250;
export const rewindSpeed = 8;

export class Game extends Scene {
  player: Player;
  text: GameObjects.Text;
  text2: GameObjects.Text;
  bar: GameObjects.Rectangle;

  stairs: GameObjects.Group;
  npcs: GameObjects.Group;

  keys: { [key: string]: Input.Keyboard.Key } | undefined;

  clock: number;
  rewindable: Rewindable[];
  rewinding: boolean = false;
  count: number = 0;

  constructor() {
    super('Game');
    this.clock = 0;
  }

  create() {
    // input
    this.keys = this.input.keyboard?.addKeys('SHIFT') as { [key: string]: Input.Keyboard.Key };

    // game objects
    this.add.sprite(0, 0, 'town').setOrigin(0, 0);
    // const walls = new Walls(this);
    this.player = new Player(this, 100, 650);

    const stairs1 = new Stairs(this, 0, this.player);
    const stairs2 = new Stairs(this, 1, this.player);

    const npc1 = new NPC(this, 0, this.player);
    const npc2 = new NPC(this, 1, this.player);

    this.text = this.add.text(10, 20, '', { fontFamily: 'sans', fontSize: 24, color: `#${Colors.White}` }).setScrollFactor(0);
    this.bar = this.add.rectangle(0, Config.height - 6, 0, 6, 0xccaa00).setScrollFactor(0);

    // groups (for automatically updating)

    this.stairs = this.add.group([], { runChildUpdate: true });
    this.stairs.add(stairs1);
    this.stairs.add(stairs2);

    this.npcs = this.add.group([], { runChildUpdate: true });
    this.npcs.add(npc1);
    this.npcs.add(npc2);

    // update items added to the group
    this.add.group([this.player], { runChildUpdate: true });

    // rewindable objects
    this.rewindable = [this.player];

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

    this.physics.add.overlap(
      this.player,
      this.npcs,
      (_, npc) => {
        this.player.setInteractiveObject(npc as NPC);
      },
      undefined,
      this
    );

    // events
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.pause();
      this.scene.launch('Paused');
    });

    this.input.keyboard?.on('keydown-SHIFT', () => {
      this.rewinding = true;
      this.rewindable.forEach((r) => r.setRewind(true));
    });

    this.input.keyboard?.on('keyup-SHIFT', () => {
      this.rewinding = false;
      this.rewindable.forEach((r) => r.setRewind(false));
    });

    // setup
    this.cameras.main.startFollow(this.player);
  }

  update(_time: number, delta: number): void {
    if (this.clock > gameTime) {
      this.text2 = this.add.text(250, 250, 'Day Over', { fontFamily: 'sans', fontSize: 96 }).setScrollFactor(0);

      this.rewinding = true;
      this.rewindable.forEach((r) => r.setRewind(true));
    }

    if (this.rewinding) {
      if (this.clock > 0) {
        this.clock = Math.max(0, this.clock - delta * rewindSpeed);
      } else {
        this.rewinding = false;
        this.rewindable.forEach((r) => r.setRewind(false));
        this.text2?.destroy();
      }
    } else {
      if (this.count > rewindInterval) {
        this.rewindable.forEach((r) => r.record());
        this.count = 0;
      }

      this.count += delta;
      this.clock += delta;
    }

    this.text.setText(`Time: ${Math.floor(this.clock / 1000)}`);
    this.bar.width = (this.clock / gameTime) * Config.width;

    // this.cameras.main.centerOn(this.player.x, this.player.y);
  }
}
