import { GameObjects, Physics, Scene } from 'phaser';

import { Config } from '../../config';
import { Layer } from '../../data/layers';
import { SignData } from '../../data/sign';
import { LazyInitialize, SignType } from '../../data/types';
import { Game } from '../../scenes/Game';
import { initializeObject } from '../../utils/interactionUtils';
import { isDaytime } from '../../utils/lighting';
import { shouldInitialize } from '../../utils/util';
import { DebugLight } from '../Debug/DebugLight';
import { Player } from '../Player/Player';

export class Sign extends Physics.Arcade.Image implements LazyInitialize {
  player: Player;
  initialized: boolean = false;
  signType: SignType;
  text: GameObjects.Text;
  light: GameObjects.Light | DebugLight;

  constructor(scene: Scene, type: SignType, player: Player) {
    const { x, y } = SignData[type];
    super(scene, x, y, 'props', 'paper');

    this.name = `Sign-${type}`;
    this.player = player;
    this.signType = type;

    initializeObject(this, { ...SignData[type], depth: Layer.Player, origin: { x: 0.5, y: 0.5 } });
    this.setTint(0xccbbaa);
  }

  lazyInit(): void {
    if (this.initialized || !shouldInitialize(this, this.player)) return;

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    if (Config.debug) this.setInteractive({ draggable: true });

    const { x, y, text } = SignData[this.signType];
    this.text = this.scene.add
      .text(x, y, text.toUpperCase(), {
        fontFamily: 'Germania One',
        fontStyle: 'normal',
        fontSize: 28,
        color: '#372737',
        stroke: '#8e6117',
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(Layer.Player + 1)
      .setPipeline('Light2D');

    const padding = 5;
    this.setDisplaySize(this.text.displayWidth + padding * 8, this.text.displayHeight + padding);

    this.initialized = true;

    const night = !isDaytime(this.scene);
    const intensity = 1;
    if (Config.debug) {
      this.light = new DebugLight(this.scene, this.x, this.y, 300 * (this.displayWidth / 400), 0xffccaa, intensity);
      this.light.light.setVisible(night);
    } else {
      this.light = this.scene.lights.addLight(this.x, this.y, 300 * (this.displayWidth / 400), 0xffccaa, intensity);
      this.light.setVisible(night);
    }

    (this.scene as Game).lightData.push({ light: this.light, intensity, random: Math.random() });
  }

  update() {
    this.lazyInit();

    this.text?.setPosition(this.x, this.y);
    this.light?.setPosition(this.x, this.y);
  }
}
