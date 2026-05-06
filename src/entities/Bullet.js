export default class Bullet {
    constructor(scene, x, y, targetX, targetY) {
        this.scene = scene;

        this.sprite = scene.add.rectangle(x, y, 6, 6, 0xffff00);
        scene.physics.add.existing(this.sprite);

        scene.physics.moveTo(this.sprite, targetX, targetY, 500);

        this.lifespan = 1000;

        this.damage = 1; // default
    }

    update(time, delta) {
        this.lifespan -= delta;

        if (this.lifespan <= 0) {
            this.destroy();
        }
    }

    destroy() {
        if (this.sprite) this.sprite.destroy();
    }
}