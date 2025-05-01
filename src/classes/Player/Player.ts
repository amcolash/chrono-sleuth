import { GameObjects, Math as PhaserMath, Physics } from 'phaser';

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
export const speed = (Config.fastMode ? 350 : 175) * size;
const MAX_HISTORY = 1000;

export const playerFirstName = 'Rosie';
export const playerLastName = 'Vale';
export const playerName = playerFirstName + ' ' + playerLastName;

export const playerStart = new PhaserMath.Vector2(920, 1500);

export class Player extends Physics.Arcade.Sprite implements Rewindable {
  scene: Game;

  keys: InputManager;
  shadow: GameObjects.Image;
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

  previousPosition: PhaserMath.Vector2 = new PhaserMath.Vector2();
  walkingSound: Phaser.Sound.BaseSound;
  lastPlayedSound: number = 0;

  counter: number = 0;
  history: PhaserMath.Vector3[] = [];
  rewinding: boolean = false;

  /** Disabled prevents player interactions, but does not stop updates. It is usually better to use setActive(false); */
  disabled: boolean = false;

  // Prevents camera from being locked when warping
  unlockCamera: boolean = false;

  constructor(scene: Game) {
    super(scene, playerStart.x, playerStart.y, 'character', 0);
    this.name = 'Player';

    this.scene = scene;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    if (Config.debug) this.setInteractive();

    this.setBodySize(48, 74)
      .setDepth(Layer.Player)
      .setScale(size)
      .setPipeline('Light2D')
      .setPostPipeline('XRayPipeline');

    if (Config.debug) {
      this.light = new DebugLight(scene, this.x, this.y, 200, 0xffddbb, 1);
      this.debug = scene.add.circle(this.x, this.y, 3, 0xff00ff).setDepth(Layer.Debug);
    } else {
      this.light = scene.lights.addLight(this.x, this.y, 200, 0xffddbb, 1);
    }

    this.shadow = this.scene.add
      .image(this.x, this.y, 'props', 'warp')
      .setPipeline('Light2D')
      .setScale(0.7, 0.15)
      .setTint(0x000000);

    createAnimation(this);

    this.keys = new InputManager(scene);

    this.message = new Message(scene, this);
    this.inventory = new Inventory(scene);
    this.quests = new Quests(scene, this);
    this.journal = new Journal(scene, this);
    this.gameState = new GameState(scene, this);

    this.walkingSound = scene.sound.addAudioSprite('sfx');

    if (Config.perfTest) {
      scene.time.delayedCall(1000, () => {
        this.setVelocityX(speed);
        scene.time.addEvent({
          delay: 1000,
          callback: () => this.setVelocityX(this.body ? -this.body.velocity.x : 0),
          loop: true,
        });
      });
    }
  }

  update(_time: number, delta: number) {
    // Update UI
    const promptVisible = (this.interactive && !this.message.visible && this.buttonPrompt?.text?.length > 0) || false;
    if (promptVisible && !this.buttonPrompt) this.buttonPrompt = new ButtonPrompt(this.scene);

    this.buttonPrompt?.setVisible(promptVisible);

    // Update player
    if (!Config.perfTest) {
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
    }

    if (Config.debug) {
      this.setTint(this.interactive ? 0xffaaaa : 0xffffff);
    }

    // Update animations
    updateAnimation(this);

    const moved = Math.abs(this.body?.velocity.x || 0) > 1 || Math.abs(this.body?.velocity.y || 0) > 1;
    if (moved && !this.walkingSound.isPlaying && Date.now() - this.lastPlayedSound > 150)
      this.walkingSound.play('ladder', { loop: true, rate: 0.75, volume: 0.4 });
    else if (!moved) {
      this.walkingSound.stop();
      this.lastPlayedSound = Date.now();
    }

    this.previousPosition.set(this.x, this.y);

    if (this.shadow.rotation > 0) this.shadow.setRotation(Math.max(0, this.shadow.rotation - 0.075));
    if (this.shadow.rotation < 0) this.shadow.setRotation(Math.min(0, this.shadow.rotation + 0.075));
    this.shadow.setAlpha(this.rotation !== 0 ? 0.25 : 0.5);
  }

  postUpdate() {
    this.light.setPosition(this.x, this.y - 20);
    this.shadow.setPosition(this.x, this.y + this.displayHeight / 2);

    if (Config.debug) {
      this.debug?.setPosition(this.x, this.y);
    }
  }

  checkInteraction(): InteractResult | undefined {
    if (this.disabled) return undefined;

    let ret = undefined;

    if (this.interactive && Date.now() > this.interactionTimeout) {
      ret = this.interactive.onInteract(this.keys.keys);

      if (ret !== InteractResult.None) {
        this.interactionTimeout = Date.now() + (this.interactive?.interactionTimeout || 500);
        this.keys.resetKeys();

        if (ret === InteractResult.Teleported) this.interactive = undefined;
      }
    }

    return ret;
  }

  updateVelocity() {
    const keys = this.keys.keys;
    let multiplier = 1;
    if (!Config.prod && keys[Key.Shift]) multiplier = 2;
    this.anims.timeScale = multiplier;

    const calcSpeed = speed * multiplier;

    if (keys[Key.Left]) this.setVelocityX(-calcSpeed);
    if (keys[Key.Right]) this.setVelocityX(calcSpeed);

    if (Config.debug && !this.interactive) {
      if (keys[Key.Up]) this.setVelocityY(-calcSpeed);
      if (keys[Key.Down]) this.setVelocityY(calcSpeed);
    }

    if (keys[Key.Left] && keys[Key.Right]) this.setVelocityX(0);
  }

  setY(y: number): this {
    this.setPosition(this.x, y);
    return this;
  }

  record() {
    if (this.history.length < MAX_HISTORY)
      this.history.push(new PhaserMath.Vector3(this.x, this.y, this.body?.velocity.x || 0));
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
    this.buttonPrompt?.setVisible(this.message.visible ? false : text?.length > 0);
  }
}
