import { GameObjects, Math as PhaserMath } from 'phaser';

import { Config } from '../config';
import { createAnimation, updateAnimation } from '../utils/animations';
import { Layer } from '../utils/layers';
import { rewindInterval, rewindSpeed } from './Clock';
import { DebugLight } from './DebugLight';
import { InputManager, Key } from './InputManager';
import { Inventory } from './Inventory';
import { Journal } from './Journal';
import { Quests } from './Quests';
import { ButtonPrompt } from './UI/ButtonPrompt';
import { Message } from './UI/Message';
import { InteractResult, Interactive, Rewindable } from './types';

const size = 1.35;
const speed = (Config.fastMode ? 350 : 120) * size;
const MAX_HISTORY = 1000;

export const playerStart = new PhaserMath.Vector2(400, 650);

export class Player extends Phaser.Physics.Arcade.Sprite implements Rewindable {
  keys: InputManager;
  light: GameObjects.Light | DebugLight;

  buttonPrompt: GameObjects.Text;
  interactive?: Interactive;
  interactionTimeout: number = 0;

  message: Message;
  inventory: Inventory;
  quests: Quests;
  journal: Journal;

  counter: number = 0;
  history: Phaser.Math.Vector3[] = [];
  rewinding = false;

  constructor(scene: Phaser.Scene) {
    super(scene, playerStart.x, playerStart.y, 'character', 0);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    if (Config.debug) this.setInteractive();

    this.setBodySize(48, 70)
      .setOffset(40, 10)
      .setOrigin(0.5, 0.65)
      .setDepth(Layer.Player)
      .setScale(size)
      .setPipeline('Light2D');

    if (Config.debug) {
      this.light = new DebugLight(scene, this.x, this.y, 250, 0xffddbb, 1.2);
    } else {
      this.light = scene.lights.addLight(this.x, this.y, 250, 0xffddbb, 1.2);
    }

    createAnimation(this);

    this.keys = new InputManager(scene);
    this.buttonPrompt = new ButtonPrompt(scene);

    this.message = new Message(scene, this);
    this.inventory = new Inventory(scene);
    this.quests = new Quests(scene);
    this.journal = new Journal(scene, this);
  }

  update(_time: number, delta: number) {
    // Update UI
    if (Config.debug) this.setTint(this.interactive ? 0xffaaaa : 0xffffff);
    this.buttonPrompt.setVisible(
      (this.interactive && !this.message.visible && this.buttonPrompt.text.length > 0) || false
    );

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

    this.light.setPosition(this.x, this.y);

    // Update animations
    updateAnimation(this);
  }

  checkInteraction(): InteractResult | undefined {
    let ret = undefined;

    if (this.interactive && Date.now() > this.interactionTimeout) {
      ret = this.interactive.onInteract(this.keys.keys);

      if (ret !== InteractResult.None) {
        this.interactionTimeout = Date.now() + (this.interactive.interactionTimeout || 500);
        this.keys.resetKeys();

        if (ret === InteractResult.Teleported) this.interactive = undefined;
      }
    }

    return ret;
  }

  updateVelocity() {
    let calcSpeed = speed;
    const keys = this.keys.keys;

    if (keys[Key.Left]) this.setVelocityX(-calcSpeed);
    if (keys[Key.Right]) this.setVelocityX(calcSpeed);

    if (Config.debug && !this.interactive) {
      if (keys[Key.Up]) this.setVelocityY(-calcSpeed);
      if (keys[Key.Down]) this.setVelocityY(calcSpeed);
    }

    if (keys[Key.Left] && keys[Key.Right]) this.setVelocityX(0);
  }

  record() {
    if (this.history.length < MAX_HISTORY)
      this.history.push(new Phaser.Math.Vector3(this.x, this.y, this.body?.velocity.x || 0));
    else console.warn('Max history reached');
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

  reset() {
    this.quests.reset();
    this.setPosition(playerStart.x, playerStart.y);
    this.flipX = false;
    this.setVelocity(0);
  }

  setInteractiveObject(interactive?: any): undefined {
    this.interactive = interactive;
    this.buttonPrompt.setText(interactive?.getButtonPrompt?.() || '');
  }
}
