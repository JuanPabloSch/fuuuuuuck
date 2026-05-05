import Bullet from "./Bullet.js";

export default class WeaponSystem {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;

        this.fireRate = 200; // ms
        this.lastShot = 0;
    }

    canShoot(time) {
        return time > this.lastShot + this.fireRate;
    }

    shoot(time, pointer) {
        if (!this.canShoot(time)) return;

        const angle = this.player.sprite.rotation;
        const offset = 22;

        const spawnX = this.player.sprite.x + Math.cos(angle) * offset;
        const spawnY = this.player.sprite.y + Math.sin(angle) * offset;

        const bullet = new Bullet(
            this.scene,
            spawnX,
            spawnY,
            pointer.worldX,
            pointer.worldY
        );

        this.scene.bullets.push(bullet);

        this.lastShot = time;
    }
}