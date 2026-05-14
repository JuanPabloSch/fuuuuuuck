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
                magSize: 9,
                bullets: 1,
                spread: 0,
                damage: 1,
                reloading: false,
                lastShot: 0
            },
            shotgun: {
                fireRate: 600,
                magSize: 6,
                bullets: 3,
                spread: 0.25,
                damage: 3,
                reloading: false,
                lastShot: 0
            },
            rifle: {
                fireRate: 80,
                magSize: 18,
                bullets: 1,
                spread: 0,
                damage: 2,
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

    // Si no hay balas, usamos el sonido de "empty" de la pistola para todas
    if (!this.w.reloading && this.canShoot(time) && ammo <= 0) {
        this.scene.sound.play("pistol_empty", { volume: 0.4 });
        this.w.lastShot = time;
        return;
    }

    if (this.w.reloading || !this.canShoot(time) || ammo <= 0) return;

    // --- SONIDO DINÁMICO ---
    // Busca "pistol_shot", "shotgun_shot", etc.
    const shotSoundKey = `${this.activeWeapon}_shot`;
    if (this.scene.cache.audio.exists(shotSoundKey)) {
        this.scene.sound.play(shotSoundKey, { 
            volume: this.activeWeapon === "rocket" ? 0.8 : 0.5, // Más volumen al cohete
            detune: Phaser.Math.Between(-100, 100) 
        });
    }

    // ... (aquí va toda tu lógica de ráfagas, ángulos y creación de balas que ya tenías)
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
    if (this.w.reloading || PlayerState.ammo[this.activeWeapon] === this.w.magSize) return;

    // --- SONIDO DINÁMICO DE RECARGA ---
    const reloadSoundKey = `${this.activeWeapon}_reload`;
    if (this.scene.cache.audio.exists(reloadSoundKey)) {
        this.scene.sound.play(reloadSoundKey, { volume: 0.5 });
    }

    this.w.reloading = true;

    // Tiempo de recarga: puedes hacerlo dinámico si quieres 
    // (ej: la escopeta podría tardar más que la pistola)
    const reloadTime = (this.activeWeapon === "rocket") ? 2000 : 1200;

    this.scene.time.delayedCall(reloadTime, () => {
        PlayerState.ammo[this.activeWeapon] = this.w.magSize;
        this.w.reloading = false;
    });
}
}