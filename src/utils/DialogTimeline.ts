import { Scene, Time, Types } from 'phaser';

import { Message } from '../classes/UI/Message';

export class DialogTimeline {
  scene: Scene;
  message: Message;
  timeline: Time.Timeline;
  onComplete: () => void;

  constructor(scene: Scene, message: Message) {
    this.scene = scene;
    this.message = message;
    this.timeline = scene.add.timeline([]);

    scene.input.keyboard?.on('keydown-BACK_SLASH', () => {
      this.timeline.stop();
      this.message.setDialog();
      this.onComplete();
    });
  }

  addDialog(m: string | string[], portrait: string, time: number = 500) {
    const messages: string[] = typeof m === 'string' ? [m] : m;
    this.timeline.add({
      from: time,
      run: () => {
        this.timeline.pause();
        this.message.setDialog({ messages, onCompleted: () => this.timeline.resume() }, undefined, portrait);
      },
    });
  }

  add(config: Types.Time.TimelineEventConfig | Types.Time.TimelineEventConfig[]) {
    this.timeline.add(config);
  }

  setOnComplete(fn: () => void) {
    this.onComplete = fn;

    this.timeline.add({
      from: 500,
      run: fn,
    });
  }

  start(): void {
    this.timeline.play();
  }
}
