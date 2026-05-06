export default class Zombie {
    constructor(scene, x, y, type = "normal") {
        this.scene = scene;
        this.type = type;

        this.sprite = scene.add.rectangle(x, y, 28, 28, 0xff0000);
        scene.physics.add.existing(this.sprite);

        // 🎯 valores base por tipo
        if (type === "fast") {
            this.hp = 1;
            this.speed = 140;
            this.sprite.fillColor = 0xffaa00;
        }

        else if (type === "tank") {
            this.hp = 5;
            this.speed = 50;
            this.sprite.fillColor = 0x5555ff;
        }

        else {
            this.hp = 3;
            this.speed = 80;
            this.sprite.fillColor = 0xff0000;
        }
    }

    update(player) {
        this.scene.physics.moveToObject(this.sprite, player.sprite, this.speed);
    }

    takeDamage(dmg = 1) {
        this.hp -= dmg;

        this.sprite.fillColor = 0xffffff;

        setTimeout(() => {
            if (this.sprite) {
                this.sprite.fillColor =
                    this.type === "fast" ? 0xffaa00 :
                    this.type === "tank" ? 0x5555ff :
                    0xff0000;
            }
        }, 80);

        if (this.hp <= 0) {
            this.destroy();
        }
    }

    destroy() {
        if (this.sprite) {
            this.sprite.destroy();
            this.sprite = null;
        }
    }
}