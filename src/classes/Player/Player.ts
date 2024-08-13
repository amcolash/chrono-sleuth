import { GameObjects, Math, Math as PhaserMath, Physics } from 'phaser';

import { Config } from '../../config';
import { Layer } from '../../data/layers';
import { InteractResult, Interactive, Rewindable } from '../../data/types';
import { Game } from '../../scenes/Game';
import { createAnimation, updateAnimation } from '../../utils/animations';
import { DebugLight } from '../Debug/DebugLight';
import { rewindInterval, rewindSpeed } from '../Environment/Clock';
import { ButtonPrompt } from '../UI/ButtonPrompt';
import { InputManager, Key } from '../UI/InputManager';
import { Message } from '../UI/Message';
import { GameState } from './GameState';
import { Inventory } from './Inventory';
import { Journal } from './Journal';
import { Quests } from './Quests';

const size = 1.35;
export const speed = (Config.fastMode ? 350 : 120) * size;
const MAX_HISTORY = 1000;

export const playerStart = new PhaserMath.Vector2(400, 650);

export class Player extends Physics.Arcade.Sprite implements Rewindable {
  scene: Game;

  keys: InputManager;
  light: GameObjects.Light | DebugLight;
  debug: GameObjects.Arc;

  buttonPrompt: GameObjects.Text;
  interactive?: Interactive;
  interactionTimeout: number = 0;

  message: Message;

  inventory: Inventory;
  quests: Quests;
  journal: Journal;
  gameState: GameState;

  counter: number = 0;
  history: Math.Vector3[] = [];
  rewinding = false;

  constructor(scene: Game) {
    super(scene, playerStart.x, playerStart.y, 'character', 0);

    this.scene = scene;

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
      this.light = new DebugLight(scene, this.x, this.y, 200, 0xffddbb, 1.2);
      this.debug = scene.add.circle(this.x, this.y, 3, 0xff00ff).setDepth(Layer.Debug);
    } else {
      this.light = scene.lights.addLight(this.x, this.y, 200, 0xffddbb, 1.2);
    }

    createAnimation(this);

    this.keys = new InputManager(scene);

    this.message = new Message(scene, this);
    this.inventory = new Inventory(scene);
    this.quests = new Quests(scene, this);
    this.journal = new Journal(scene, this);
    this.gameState = new GameState(scene, this);
  }

  update(_time: number, delta: number) {
    if (Config.debug) {
      this.setTint(this.interactive ? 0xffaaaa : 0xffffff);
      this.debug.setPosition(this.x, this.y);
    }

    // Update UI
    const visible = (this.interactive && !this.message.visible && this.buttonPrompt?.text?.length > 0) || false;
    if (visible && !this.buttonPrompt) this.buttonPrompt = new ButtonPrompt(this.scene);

    this.buttonPrompt?.setVisible(visible);

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
      this.history.push(new Math.Vector3(this.x, this.y, this.body?.velocity.x || 0));
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
    if (interactive?.onCollided) interactive.onCollided();

    const text = interactive?.getButtonPrompt?.();

    if (text && !this.buttonPrompt) this.buttonPrompt = new ButtonPrompt(this.scene);
    this.buttonPrompt?.setText(text);
  }
}
