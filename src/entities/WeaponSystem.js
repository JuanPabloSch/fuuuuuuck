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
                lastShot: 0,
                bullets: 1
            },

            shotgun: {
                fireRate: 600,
                magSize: 5,
                ammo: 5,
                reloading: false,
                lastShot: 0,
                bullets: 5,
                spread: 0.25
            },

            rifle: {
                fireRate: 80,
                magSize: 30,
                ammo: 30,
                reloading: false,
                lastShot: 0,
                bullets: 1
            }
        };

        // 🔒 por ahora todas desbloqueadas para test
        this.unlockedWeapons = {
            pistol: true,
            shotgun: true,
            rifle: true
        };
    }

    get w() {
        return this.weapons[this.activeWeapon];
    }

    setWeapon(name) {
        if (!this.weapons[name]) return;
        if (!this.unlockedWeapons[name]) return;

        this.activeWeapon = name;
    }

    canShoot(time) {
        return time > this.w.lastShot + this.w.fireRate;
    }

    shoot(time, pointer) {

        if (this.w.reloading) return;
        if (!this.canShoot(time)) return;
        if (this.w.ammo <= 0) return;

        const baseAngle = this.player.sprite.rotation;
        const offset = 22;

        const spawnX = this.player.sprite.x + Math.cos(baseAngle) * offset;
        const spawnY = this.player.sprite.y + Math.sin(baseAngle) * offset;

        const bulletCount = this.w.bullets;

        for (let i = 0; i < bulletCount; i++) {

            let angle = baseAngle;

            // 🔫 shotgun spread
            if (this.activeWeapon === "shotgun") {
                const spread = this.w.spread;
                angle += Phaser.Math.FloatBetween(-spread, spread);
            }

            const targetX = pointer.worldX + Math.cos(angle) * 100;
            const targetY = pointer.worldY + Math.sin(angle) * 100;

            const bullet = new Bullet(
                this.scene,
                spawnX,
                spawnY,
                targetX,
                targetY
            );

            this.scene.bullets.push(bullet);
        }

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