import Bullet from "./Bullet.js";
import PlayerState from "../state/PlayerState.js";

export default class WeaponSystem {

    constructor(scene, player) {
        this.scene = scene;
        this.player = player;

        this.activeWeapon = PlayerState.activeWeapon || "pistol";

        this.weapons = {
            pistol: {
                fireRate: 200,
                magSize: 10,
                bullets: 1,
                spread: 0,
                damage: 1,
                reloading: false,
                lastShot: 0
            },
            shotgun: {
                fireRate: 600,
                magSize: 5,
                bullets: 5,
                spread: 0.25,
                damage: 3,
                reloading: false,
                lastShot: 0
            },
            rifle: {
                fireRate: 80,
                magSize: 30,
                bullets: 1,
                spread: 0,
                damage: 1,
                reloading: false,
                lastShot: 0
            },
            // --- 🚀 NUEVA ARMA: ROCKET LAUNCHER ---
            rocket: {
                fireRate: 1500, // Muy lento entre tiros
                magSize: 1,    // Un solo cohete por carga
                bullets: 1,
                spread: 0,
                damage: 50,    // ¡DAÑO MASIVO!
                reloading: false,
                lastShot: 0
            }
        };
    }

    get w() {
        return this.weapons[this.activeWeapon];
    }

    shoot(time, pointer) {
        const ammo = PlayerState.ammo[this.activeWeapon];

        if (this.w.reloading) return;
        if (!this.canShoot(time)) return;
        if (ammo <= 0) return;

        const baseAngle = Phaser.Math.Angle.Between(
            this.player.sprite.x,
            this.player.sprite.y,
            pointer.worldX,
            pointer.worldY
        );
        const offset = 22;

        const spawnX = this.player.sprite.x + Math.cos(baseAngle) * offset;
        const spawnY = this.player.sprite.y + Math.sin(baseAngle) * offset;

        // Efecto visual de retroceso o sacudida para el Rocket
        if (this.activeWeapon === "rocket") {
        bullet.sprite.setScale(3); // Bien grande
        bullet.sprite.setTint(0xffaa00); // Color fuego/naranja
    }


        for (let i = 0; i < this.w.bullets; i++) {
            let angle = baseAngle;

            if (this.activeWeapon === "shotgun") {
                angle += Phaser.Math.FloatBetween(-this.w.spread, this.w.spread);
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

            bullet.damage = this.w.damage;
            
            // Si es un cohete, podemos agrandar el sprite de la bala
            if (this.activeWeapon === "rocket") {
                bullet.sprite.setScale(2);
                bullet.sprite.setTint(0xff0000); // Bala roja
            }

            this.scene.bullets.push(bullet);
        }

        PlayerState.ammo[this.activeWeapon]--;
        this.w.lastShot = time;
    }

    setWeapon(name) {
        if (!this.weapons[name]) return;
        if (!PlayerState.weapons[name]) return;

        this.activeWeapon = name;
        PlayerState.activeWeapon = name;
    }

    canShoot(time) {
        return time > this.w.lastShot + this.w.fireRate;
    }

    reload() {
        if (this.w.reloading) return;
        this.w.reloading = true;

        setTimeout(() => {
            PlayerState.ammo[this.activeWeapon] = this.w.magSize;
            this.w.reloading = false;
        }, 1200);
    }
}
