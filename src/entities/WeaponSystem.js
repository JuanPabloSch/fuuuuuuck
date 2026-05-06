import Bullet from "./Bullet.js";

export default class WeaponSystem {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;

        this.activeWeapon = "pistol";

        this.weapons = {
            pistol: {
                fireRate: 200,
                magSize: 10,
                ammo: 10,
                reloading: false,
                lastShot: 0
            }
        };
    }

    get w() {
        return this.weapons[this.activeWeapon];
    }

    canShoot(time) {
        return time > this.w.lastShot + this.w.fireRate;
    }

    shoot(time, pointer) {

        if (this.w.reloading) return;
        if (!this.canShoot(time)) return;
        if (this.w.ammo <= 0) return;

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

        this.w.ammo--;
        this.w.lastShot = time;
    }

    reload() {
        if (this.w.reloading) return;

        this.w.reloading = true;

        setTimeout(() => {
            this.w.ammo = this.w.magSize;
            this.w.reloading = false;
        }, 1200);
    }
}