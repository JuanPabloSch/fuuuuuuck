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
    if (this.w.reloading || !this.canShoot(time) || ammo <= 0) return;

    const baseAngle = Phaser.Math.Angle.Between(this.player.sprite.x, this.player.sprite.y, pointer.worldX, pointer.worldY);
    const spawnX = this.player.sprite.x + Math.cos(baseAngle) * 22;
    const spawnY = this.player.sprite.y + Math.sin(baseAngle) * 22;

    for (let i = 0; i < this.w.bullets; i++) {
        let angle = baseAngle;
        if (this.activeWeapon === "shotgun") angle += Phaser.Math.FloatBetween(-this.w.spread, this.w.spread);

        const targetX = pointer.worldX + Math.cos(angle) * 100;
        const targetY = pointer.worldY + Math.sin(angle) * 100;

        // 1. Creamos la bala (estática por un milisegundo)
        const bullet = new Bullet(this.scene, spawnX, spawnY);
        
        // 2. Definimos velocidad según el arma
        let speed = (this.activeWeapon === "rocket") ? 200 : 600;
        
        // 3. LA DISPARAMOS
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
    
    // Avisamos al player que cambie el dibujo
    this.player.updateWeaponVisual(name);
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
