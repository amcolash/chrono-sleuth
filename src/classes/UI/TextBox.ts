import { GameObjects, Scene, Types } from 'phaser';

const scrollbarWidth = 4;

export class TextBox extends GameObjects.Container {
  textObject: GameObjects.Text;
  maskGraphics: GameObjects.Graphics;
  scrollbar: GameObjects.Rectangle;

  scrollY: number;
  boxHeight: number;

  constructor(scene: Scene, x: number, y: number, text: string | string[], style?: Types.GameObjects.Text.TextStyle) {
    super(scene, x, y);
    scene.add.existing(this);

    this.scrollY = 0;
    this.boxHeight = 0;

    // Create text object
    this.textObject = new GameObjects.Text(scene, 0, 0, text, { padding: { x: 10, y: 10 }, ...style });
    this.textObject.setOrigin(0).setScrollFactor(0).setInteractive();
    this.add(this.textObject);

    // Set up scroll events
    scene.input.on('wheel', this.handleScroll, this);
    this.textObject.on('pointermove', this.handleDrag, this);

    // Create mask
    this.maskGraphics = scene.add.graphics().setPosition(x, y).setScrollFactor(0).setVisible(false);
    this.add(this.maskGraphics);

    // Create scrollbar
    this.scrollbar = scene.add.rectangle(0, 0, scrollbarWidth, 0, 0x555555).setScrollFactor(0);
    this.add(this.scrollbar);
  }

  setBoxSize(width: number, height: number) {
    this.boxHeight = height;

    // Create mask
    this.maskGraphics.clear();
    this.maskGraphics.fillStyle(0xffffff);
    this.maskGraphics.fillRect(0, 0, width, height);
    const mask = this.maskGraphics.createGeometryMask();
    this.textObject.setMask(mask);

    // Adjust the text size
    this.textObject.setWordWrapWidth(width - scrollbarWidth);
    this.textObject.setFixedSize(width - scrollbarWidth, 0); // Set fixed width, height will auto-adjust

    // Ensure initial cropping
    this.updateTextPosition();
  }

  private handleDrag(pointer: Phaser.Input.Pointer) {
    if (pointer.isDown) {
      this.scrollY -= pointer.velocity.y;
      this.updateTextPosition();
    }
  }

  private handleScroll(
    _pointer: Phaser.Input.Pointer,
    _currentlyOver: any,
    _deltaX: number,
    deltaY: number,
    _deltaZ: number
  ) {
    this.scrollY += deltaY * 0.5; // Adjust scroll speed as needed
    this.updateTextPosition();
  }

  private updateTextPosition() {
    const maxScrollY = Math.max(0, this.textObject.height - this.boxHeight);
    this.scrollY = Phaser.Math.Clamp(this.scrollY, 0, maxScrollY);
    this.textObject.y = -this.scrollY;

    // Update scrollbar
    const percent = this.scrollY / maxScrollY;
    const visiblePercent = this.boxHeight / this.textObject.height;
    this.scrollbar.height = visiblePercent * this.boxHeight;
    this.scrollbar.setPosition(this.textObject.width - 4, percent * (this.boxHeight - visiblePercent * this.boxHeight));
  }
}
