export default class Zombie {

    constructor(scene, x, y, type = "normal") {

        this.scene = scene;
        this.type = type;
        this.canHit = true;
        this.sprite = scene.physics.add.sprite(x, y, null)
            .setDisplaySize(20, 20)
            .setTint(this.getColor());

        this.setStats();
    }

    setStats() {

        switch (this.type) {

            case "fast":
                this.speed = 120;
                this.hp = 1;
                break;

            case "tank":
                this.speed = 30;
                this.hp = 6;
                break;

            default: // normal
                this.speed = 60;
                this.hp = 3;
                break;
        }
    }

    getColor() {
        switch (this.type) {
            case "fast": return 0xffff00; // amarillo
            case "tank": return 0xff0000; // rojo
            default: return 0x00ff00;     // verde
        }
    }

    update(player, zombies) {

        const angle = Phaser.Math.Angle.Between(
            this.sprite.x,
            this.sprite.y,
            player.sprite.x,
            player.sprite.y
        );

        this.sprite.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
        );
        const dist = Phaser.Math.Distance.Between(
        this.sprite.x,
        this.sprite.y,
        player.sprite.x,
        player.sprite.y
    );

    if (dist < 40) {

    if (!this.canHit) return;

    this.canHit = false;

    const p = this.scene.player;

    p.takeDamage(5);

    p.applyKnockback(
        this.sprite.x,
        this.sprite.y,
        120
    );

    this.scene.time.delayedCall(500, () => {
        this.canHit = true;
    });
}}

    takeDamage(dmg) {
        this.hp -= dmg;
    }

    destroy() {
        this.sprite.destroy();
    }
}