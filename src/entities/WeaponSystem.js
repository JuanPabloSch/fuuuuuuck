import Bullet from "./Bullet.js";

export default class WeaponSystem {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;

        this.fireRate = 200;
        this.lastShot = 0;

        this.magSize = 10;
        this.ammo = 10;
        this.reloading = false;
    }

    canShoot(time) {
        return time > this.lastShot + this.fireRate;
    }

    shoot(time, pointer) {

        if (this.reloading) return;
        if (!this.canShoot(time)) return;
        if (this.ammo <= 0) return;

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

        this.ammo--;
        this.lastShot = time;
    }

    reload() {
        if (this.reloading) return;

        this.reloading = true;

        setTimeout(() => {
            this.ammo = this.magSize;
            this.reloading = false;
        }, 1200);
    }
}