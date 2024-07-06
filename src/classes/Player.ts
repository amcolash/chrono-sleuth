import { GameObjects } from 'phaser';
import { Config } from '../config';
import { Message } from './Message';
import { Interactive, InteractResult, NPCType, Rewindable, TalkingPoint } from './types.';
import { fontStyle } from '../utils/colors';
import { Inventory } from './Inventory';
import { Quests } from './Quests';
import { rewindInterval, rewindSpeed } from './Clock';
import { ButtonPrompt } from './ButtonPrompt';
import { createAnimation, updateAnimation } from '../utils/animations';

const size = 2.5;
const speed = 120 * size;
const MAX_HISTORY = 1000;

export class Player extends Phaser.Physics.Arcade.Sprite implements Rewindable {
  keys: { [key: string]: Phaser.Input.Keyboard.Key };

  debugText: GameObjects.Text;

  buttonPrompt: GameObjects.Text;
  interactive?: Interactive;
  interactionTimeout: number = 0;

  message: Message = new Message(this.scene);
  inventory: Inventory;
  quests: Quests;

  talkingPoints: TalkingPoint[] = [];

  counter: number = 0;
  history: Phaser.Math.Vector3[] = [];
  rewinding = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'character', 0);

    this.keys = scene.input.keyboard?.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SHIFT,ENTER,SPACE') as {
      [key: string]: Phaser.Input.Keyboard.Key;
    };

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setBodySize(24, 36);
    this.setOffset(0, 0);
    this.depth = 1;
    this.scale = size;

    createAnimation(this);

    this.buttonPrompt = new ButtonPrompt(scene);

    this.message = new Message(scene);
    this.inventory = new Inventory(scene);
    this.quests = new Quests(scene);

    if (Config.debug) this.debugText = scene.add.text(10, 30, '', fontStyle).setScrollFactor(0);
  }

  update(_time: number, delta: number) {
    // Update UI
    if (Config.debug) {
      this.setTint(this.interactive ? 0xffaaaa : 0xffffff);
      this.debugText.setText(`x: ${Math.floor(this.x)}, y: ${Math.floor(this.y)}`);
    }
    this.buttonPrompt.setVisible((this.interactive && !this.message.visible && this.buttonPrompt.text.length > 0) || false);

    // Update player
    this.setVelocity(0);

    // Handle rewinding, interactions, and velocity
    if (this.rewinding) {
      if (this.counter + delta > rewindInterval / rewindSpeed) {
        this.rewind();
        this.counter = 0;
      } else {
        this.counter += delta;
      }
    } else {
      let ret: InteractResult | undefined = this.checkInteraction();
      if (!ret && !this.message.visible) this.updateVelocity();
    }

    // Update animations
    updateAnimation(this);
  }

  checkInteraction(): InteractResult | undefined {
    let ret = undefined;

    if (this.interactive && Date.now() > this.interactionTimeout) {
      ret = this.interactive.onInteract(this.keys);

      if (ret !== InteractResult.None) {
        this.interactionTimeout = Date.now() + (this.interactive.interactionTimeout || 0);

        if (ret === InteractResult.Teleported) this.interactive = undefined;
      }
    }

    return ret;
  }

  updateVelocity() {
    const keys = {
      left: this.keys.LEFT.isDown || this.keys.A.isDown,
      right: this.keys.RIGHT.isDown || this.keys.D.isDown,
      up: this.keys.UP.isDown || this.keys.W.isDown,
      down: this.keys.DOWN.isDown || this.keys.S.isDown,
      shift: this.keys.SHIFT.isDown,
    };

    let calcSpeed = speed;

    if (keys.left) this.setVelocityX(-calcSpeed);
    if (keys.right) this.setVelocityX(calcSpeed);

    if (keys.left && keys.right) this.setVelocityX(0);
  }

  record() {
    if (this.history.length < MAX_HISTORY) this.history.push(new Phaser.Math.Vector3(this.x, this.y, this.body?.velocity.x || 0));
  }

  rewind() {
    const point = this.history.pop();
    if (point) {
      this.x = point.x;
      this.y = point.y;
      this.setVelocityX(-point.z);
    }
  }

  setRewind(rewind: boolean): void {
    this.rewinding = rewind;
    this.counter = 0;
  }

  setInteractiveObject(interactive?: any): undefined {
    this.interactive = interactive;
    this.buttonPrompt.setText(interactive?.getButtonPrompt?.() || '');
  }

  setMessage(message?: string, npcType?: NPCType) {
    this.message.setMessage(message);
  }
}
