import { GameObjects } from 'phaser';
import { Config } from '../config';
import { rewindInterval, rewindSpeed } from '../scenes/Game';
import { Message } from './Message';
import { Interactive, InteractResult, ItemType, NPCType, Quest, QuestType, Rewindable, TalkingPoint } from './types.';
import { meta } from './Item';
import { Colors, getColorNumber } from '../utils/colors';

const texture = 'robot';
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

  inventory: ItemType[] = [];
  inventoryList: GameObjects.Container;

  quests: Quest[] = [];
  questList: GameObjects.Container;
  questRectangle: GameObjects.Rectangle;

  talkingPoints: TalkingPoint[] = [];

  counter: number = 0;
  history: Phaser.Math.Vector3[] = [];
  rewinding = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, texture, 6);

    this.keys = scene.input.keyboard?.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SHIFT,ENTER,SPACE') as {
      [key: string]: Phaser.Input.Keyboard.Key;
    };

    // createWalkAnimations(texture, scene, this);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setBodySize(24, 36);
    this.setOffset(0, 0);
    this.setPushable(false);
    this.depth = 1;

    this.scale = size;

    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('character', { start: 0, end: 5 }),
      frameRate: 4,
      repeat: -1,
    });

    this.anims.play('walk');

    this.buttonPrompt = scene.add
      .text(Config.width / 2, Config.height - 50, '', { fontFamily: 'sans', fontSize: 18, color: `#${Colors.White}`, align: 'center' })
      .setScrollFactor(0)
      .setDepth(2)
      .setVisible(false);
    this.message = new Message(scene);

    this.inventoryList = scene.add
      .container(Config.width - 320, 20)
      .setScrollFactor(0)
      .setDepth(1)
      .setVisible(false);

    this.inventoryList.add(
      scene.add
        .rectangle(0, 0, 300, 60, getColorNumber(Colors.Teal))
        .setStrokeStyle(2, getColorNumber(Colors.White))
        .setAlpha(0.75)
        .setOrigin(0)
    );

    this.questList = scene.add
      .container(Config.width - 320, 100)
      .setScrollFactor(0)
      .setDepth(1)
      .setVisible(false);

    this.questRectangle = scene.add
      .rectangle(0, 0, 300, 60, getColorNumber(Colors.Teal))
      .setStrokeStyle(2, getColorNumber(Colors.White))
      .setAlpha(0.75)
      .setOrigin(0);
    this.questList.add(this.questRectangle);
    this.questList.add(scene.add.text(10, 10, 'Quests', { fontFamily: 'sans', fontSize: 24, color: `#${Colors.White}` }));

    if (Config.debug)
      this.debugText = scene.add.text(10, 30, '', { fontFamily: 'sans', fontSize: 24, color: `#${Colors.White}` }).setScrollFactor(0);
  }

  update(_time: number, delta: number) {
    if (Config.debug) {
      this.setTint(this.interactive ? 0xffaaaa : 0xffffff);
      this.debugText.setText(`x: ${Math.floor(this.x)}, y: ${Math.floor(this.y)}`);
    }
    this.buttonPrompt.setVisible((this.interactive && !this.message.visible && this.buttonPrompt.text.length > 0) || false);

    if (this.rewinding) {
      if (this.counter + delta > rewindInterval / rewindSpeed) {
        this.rewind();
        this.counter = 0;
      }
      this.counter += delta;
    } else {
      let ret: InteractResult | undefined = undefined;

      if (this.interactive && Date.now() > this.interactionTimeout) {
        ret = this.interactive.onInteract(this.keys);

        if (ret !== InteractResult.None) {
          this.interactionTimeout = Date.now() + (this.interactive.interactionTimeout || 0);

          if (ret === InteractResult.Teleported) this.interactive = undefined;
        }
      }

      if (!ret && !this.message.visible) this.updateVelocity();
    }

    const v = this.body?.velocity.x || 0;
    const flipped = v < 0;
    if (Math.abs(v) > 0) {
      this.anims.resume();
      this.flipX = this.rewinding ? !flipped : flipped;
    } else this.anims.pause();
    // updateAnim(texture, this);
  }

  record() {
    if (this.history.length < MAX_HISTORY) this.history.push(new Phaser.Math.Vector3(this.x, this.y, this.body?.velocity.x || 0));
  }

  rewind() {
    this.setVelocityX(0);

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

  updateVelocity() {
    const keys = {
      left: this.keys.LEFT.isDown || this.keys.A.isDown,
      right: this.keys.RIGHT.isDown || this.keys.D.isDown,
      up: this.keys.UP.isDown || this.keys.W.isDown,
      down: this.keys.DOWN.isDown || this.keys.S.isDown,
      shift: this.keys.SHIFT.isDown,
    };

    this.setVelocity(0);

    let calcSpeed = speed;

    if (keys.left) this.setVelocityX(-calcSpeed);
    if (keys.right) this.setVelocityX(calcSpeed);

    if (keys.left && keys.right) this.setVelocityX(0);
  }

  setMessage(message?: string, npcType?: NPCType) {
    this.message.setMessage(message);
  }

  addItem(item: ItemType) {
    this.inventory.push(item);
    const x = 30 + 50 * (this.inventory.length - 1);
    this.inventoryList.add(this.scene.add.sprite(x, 30, meta[item].image).setScale(0.25));
    this.updateItems();
  }

  updateItems() {
    let index = 0;
    this.inventoryList.getAll<GameObjects.GameObject>().forEach((item, i) => {
      if (item instanceof GameObjects.Sprite) {
        const x = 30 + 50 * index;
        item.setPosition(x, 30);
        index++;
      }
    });
    this.inventoryList.setVisible(this.inventory.length > 0);
  }

  removeItem(item: ItemType) {
    const index = this.inventory.indexOf(item);
    if (index > -1) {
      this.inventory.splice(index, 1);
      this.inventoryList
        .getAll<GameObjects.Sprite>()
        .find((i) => i.texture?.key === meta[item].image)
        ?.destroy();
    }
    this.updateItems();
  }

  addQuest(quest: Quest) {
    this.quests.push(quest);
    const y = 10 + 30 * this.quests.length;
    this.questList.add(this.scene.add.text(10, y, quest.name, { fontFamily: 'sans', fontSize: 18, color: `#${Colors.White}` }));
    this.updateQuests();
  }

  updateQuest(quest: QuestType, completed: boolean) {
    const q = this.quests.find((q) => q.id === quest);
    if (q) q.completed = completed;
    this.updateQuests();
  }

  updateQuests() {
    const activeQuests = this.quests.filter((q) => !q.completed);

    let index = 1;
    this.questList.getAll<GameObjects.Text>().forEach((text) => {
      if (text instanceof GameObjects.Text) {
        if (!activeQuests.find((q) => text.text === q.name) && text.text !== 'Quests') text.destroy();
        else if (text.text !== 'Quests') {
          const y = 10 + 30 * index;
          text.setPosition(10, y);
          index++;
        }
      }
    });

    this.questList.setVisible(activeQuests.length > 0);
    this.questRectangle.setSize(300, 40 + 30 * activeQuests.length);
  }
}
