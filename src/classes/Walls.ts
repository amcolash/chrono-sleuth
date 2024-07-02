export class Walls extends Phaser.Physics.Arcade.StaticGroup {
  constructor(scene: Phaser.Scene) {
    super(scene.physics.world, scene);

    const cam = scene.cameras.main;
    const color = 0x900000;
    const size = 4;

    this.add(scene.add.rectangle(0, 0, size, cam.height, color).setOrigin(0));
    this.add(scene.add.rectangle(cam.width - size, 0, size, cam.height, color).setOrigin(0));
    this.add(scene.add.rectangle(0, 0, cam.width, size, color).setOrigin(0));
    this.add(scene.add.rectangle(0, cam.height - size, cam.width, size, color).setOrigin(0));
  }
}
