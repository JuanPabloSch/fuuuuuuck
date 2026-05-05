export default class Zombie {
    constructor(scene, x, y) {
        this.scene = scene;

        this.sprite = scene.add.rectangle(x, y, 28, 28, 0xff0000);
        scene.physics.add.existing(this.sprite);

        this.speed = 100;
    }

    update(player) {
        this.scene.physics.moveToObject(this.sprite, player.sprite, this.speed);
    }

    destroy() {
        this.sprite.destroy();
    }
}