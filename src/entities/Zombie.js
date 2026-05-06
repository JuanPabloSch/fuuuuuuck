export default class Zombie {
    constructor(scene, x, y) {
        this.scene = scene;

        this.hp = 3; // base

        this.sprite = scene.add.rectangle(x, y, 28, 28, 0xff0000);
        scene.physics.add.existing(this.sprite);

        this.speed = 80;
    }

    update(player) {
        this.scene.physics.moveToObject(this.sprite, player.sprite, this.speed);
    }

    takeDamage(dmg = 1) {
        this.hp -= dmg;

        // feedback visual simple
        this.sprite.fillColor = 0xff5555;

        setTimeout(() => {
            if (this.sprite) this.sprite.fillColor = 0xff0000;
        }, 80);

        if (this.hp <= 0) {
            this.destroy();
        }
    }

    destroy() {
        this.sprite.destroy();
    }
}