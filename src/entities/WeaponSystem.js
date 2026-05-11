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
            rocket: {
                fireRate: 1500,
                magSize: 1,
                bullets: 1,
                spread: 0,
                damage: 50,
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

        // --- 🔊 SONIDO: CLICK DE ARMA VACÍA ---
        // Si intenta disparar, no está recargando, pero no tiene balas
        if (!this.w.reloading && this.canShoot(time) && ammo <= 0) {
            this.scene.sound.play("pistol_empty", { volume: 0.4 });
            this.w.lastShot = time; // Para que no spammee el sonido de vacío
            return;
        }

        if (this.w.reloading || !this.canShoot(time) || ammo <= 0) return;

        // --- 🔊 SONIDO: DISPARO ---
        // Usamos un pequeño detune para que no suene siempre igual
        this.scene.sound.play("pistol_shot", { 
            volume: 0.5, 
            detune: Phaser.Math.Between(-100, 100) 
        });

        const baseAngle = Phaser.Math.Angle.Between(this.player.sprite.x, this.player.sprite.y, pointer.worldX, pointer.worldY);
        const spawnX = this.player.sprite.x + Math.cos(baseAngle) * 22;
        const spawnY = this.player.sprite.y + Math.sin(baseAngle) * 22;

        for (let i = 0; i < this.w.bullets; i++) {
            let angle = baseAngle;
            if (this.activeWeapon === "shotgun") angle += Phaser.Math.FloatBetween(-this.w.spread, this.w.spread);

            const targetX = pointer.worldX + Math.cos(angle) * 100;
            const targetY = pointer.worldY + Math.sin(angle) * 100;

            const bullet = new Bullet(this.scene, spawnX, spawnY);
            let speed = (this.activeWeapon === "rocket") ? 200 : 600;
            bullet.fire(targetX, targetY, speed, this.w.damage, this.activeWeapon === "rocket");

            this.scene.bullets.push(bullet);
        }

        PlayerState.ammo[this.activeWeapon]--;
        this.w.lastShot = time;
    }

    setWeapon(name) {
        if (!this.weapons[name] || !PlayerState.weapons[name]) return;
        this.activeWeapon = name;
        PlayerState.activeWeapon = name;
        this.player.updateWeaponVisual(name);
    }

    canShoot(time) {
        return time > this.w.lastShot + this.w.fireRate;
    }

reload() {
    if (this.w.reloading) return;

    // 1. Verificación de seguridad: ¿Existe el sonido en el cache?
    if (this.scene.cache.audio.exists("pistol_reload")) {
        this.scene.sound.play("pistol_reload", { volume: 0.6 });
    } else {
        console.warn("⚠️ El sonido 'pistol_reload' no existe en el cache de Phaser.");
    }

    this.w.reloading = true;

    this.scene.time.delayedCall(1200, () => {
        PlayerState.ammo[this.activeWeapon] = this.w.magSize;
        this.w.reloading = false;
    });
}
}