import { Dialog } from './Dialog';

export class DebugTool extends Dialog {
  constructor() {
    super({ key: 'SaveDebug', title: 'Debug Tool', gamepadVisible: false });
  }

  create() {}

  handleSuccess(): void {}
}
