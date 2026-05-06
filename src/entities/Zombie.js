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

    update(player, zombies) {

    // 🎯 dirección al jugador
    let vx = player.sprite.x - this.sprite.x;
    let vy = player.sprite.y - this.sprite.y;

    // normalizamos
    const len = Math.sqrt(vx * vx + vy * vy);
    vx /= len;
    vy /= len;

    // 🧲 separación entre zombies
    let repulseX = 0;
    let repulseY = 0;

    zombies.forEach(other => {

        if (other === this) return;

        const dx = this.sprite.x - other.sprite.x;
        const dy = this.sprite.y - other.sprite.y;

        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 30 && dist > 0) {
            repulseX += dx / dist;
            repulseY += dy / dist;
        }
    });

    // ⚖️ mezcla de comportamientos
    const finalX = vx + repulseX * 1.5;
    const finalY = vy + repulseY * 1.5;

    const finalLen = Math.sqrt(finalX * finalX + finalY * finalY);

    const speedX = (finalX / finalLen) * this.speed;
    const speedY = (finalY / finalLen) * this.speed;

    this.sprite.x += speedX * 0.016;
    this.sprite.y += speedY * 0.016;
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