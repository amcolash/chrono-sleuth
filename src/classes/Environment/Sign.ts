import { GameObjects, Scene } from 'phaser';

import { Config } from '../../config';
import { Layer } from '../../data/layers';
import { SignData } from '../../data/sign';
import { LazyInitialize, SignType } from '../../data/types';
import { shouldInitialize } from '../../utils/util';
import { Player } from '../Player/Player';

export class Sign extends GameObjects.Image implements LazyInitialize {
  player: Player;
  initialized: boolean = false;
  signType: SignType;
  text: GameObjects.Text;

  constructor(scene: Scene, type: SignType, player: Player) {
    const { x, y } = SignData[type];
    super(scene, x, y, 'props', 'paper');

    this.setDepth(Layer.Player).setAngle(90).setTint(0xccbbaa).setOrigin(0.5);
    this.preFX?.addGlow(0x49320b, 1, 0, false);
    this.name = `Sign-${type}`;
    this.player = player;
    this.signType = type;
  }

  lazyInit(forceInit?: boolean): void {
    if (!forceInit && (this.initialized || !shouldInitialize(this, this.player))) return;

    this.scene.add.existing(this);
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
      .setDepth(Layer.Player + 1);
    // .setBlendMode(Phaser.BlendModes.MULTIPLY);

    const padding = 5;
    this.setDisplaySize(this.text.displayHeight + padding, this.text.displayWidth + padding * 8);

    this.initialized = true;
  }

  update() {
    this.lazyInit();
  }
}
