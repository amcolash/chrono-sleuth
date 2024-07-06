import { Physics, Scene } from 'phaser';

export class Walls extends Physics.Arcade.StaticGroup {
  constructor(scene: Scene) {
    super(scene.physics.world, scene);

    const size = 4;

    // Town Top
    this.add(scene.add.rectangle(40, 600, size, 100).setOrigin(0)).setVisible(false);
    this.add(scene.add.rectangle(1750, 600, size, 100).setOrigin(0)).setVisible(false);

    // Town Bottom
    this.add(scene.add.rectangle(70, 820, size, 100).setOrigin(0)).setVisible(false);
    this.add(scene.add.rectangle(1650, 820, size, 100).setOrigin(0)).setVisible(false);

    // Forest
    this.add(scene.add.rectangle(2600, 780, size, 100).setOrigin(0)).setVisible(false);
    this.add(scene.add.rectangle(3650, 780, size, 100).setOrigin(0)).setVisible(false);
  }
}
