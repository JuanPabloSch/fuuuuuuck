import Player from "../entities/Player.js";
import Zombie from "../entities/Zombie.js";
import Bullet from "../entities/Bullet.js";
import WeaponSystem from "../entities/WeaponSystem.js";

export default class GameScene extends Phaser.Scene {

    constructor() {
        super("GameScene");
    }

    create() {

    this.player = new Player(this, 400, 300);
    this.weapon = new WeaponSystem(this, this.player);

    this.zombies = [];
    this.bullets = [];

    this.input.mouse.disableContextMenu();

    // ✔ PRIMERO CREÁS EL HUD
    this.ammoText = this.add.text(16, 16, "", {
        fontSize: "18px",
        fill: "#ffffff"
    });

    // ✔ DESPUÉS INPUT
    this.input.mouse.disableContextMenu();

    this.input.on("pointerdown", (pointer) => {

        if (pointer.leftButtonDown()) {
            this.weapon.shoot(this.time.now, pointer);
        }

        if (pointer.rightButtonDown()) {
            this.weapon.reload();
        }
    });

    this.input.keyboard.on("keydown-ONE", () => {
    this.weapon.setWeapon("pistol");
    });

    this.input.keyboard.on("keydown-TWO", () => {
        this.weapon.setWeapon("shotgun");
    });

    this.input.keyboard.on("keydown-THREE", () => {
        this.weapon.setWeapon("rifle");
    });

    // 🧟 zombies
    this.time.addEvent({
        delay: 2000,
        loop: true,
        callback: () => this.spawnZombie()
    });
}

spawnZombie() {

    const x = Phaser.Math.Between(0, 800);
    const y = Phaser.Math.Between(0, 600);

    const rand = Math.random();

    let type = "normal";

    if (rand < 0.2) type = "fast";
    else if (rand > 0.8) type = "tank";

    const zombie = new Zombie(this, x, y, type);
    this.zombies.push(zombie);
}

    update(time, delta) {

        // 🧍 Player
        this.player.update();
        this.player.updateRotation(this.input.activePointer);

        // 🧟 Zombies
        this.zombies.forEach(z => z.update(this.player));

        // 🔫 Bullets
        this.bullets.forEach(b => b.update(time, delta));

        // 💥 Colisiones
        this.handleCollisions();
        //texto hud
        this.ammoText.setText(
        this.weapon.w.reloading
        ? `${this.weapon.activeWeapon.toUpperCase()} - Reloading...`
        : `${this.weapon.activeWeapon.toUpperCase()} | Ammo: ${this.weapon.w.ammo} / ${this.weapon.w.magSize}`
    );
    }

    handleCollisions() {

    for (let i = this.bullets.length - 1; i >= 0; i--) {

        const bullet = this.bullets[i];

        for (let j = this.zombies.length - 1; j >= 0; j--) {

            const zombie = this.zombies[j];

            const dist = Phaser.Math.Distance.Between(
                bullet.sprite.x,
                bullet.sprite.y,
                zombie.sprite.x,
                zombie.sprite.y
            );

            if (dist < 20) {

                bullet.destroy();

                zombie.takeDamage(bullet.damage || 1);

                this.bullets.splice(i, 1);

                // 👉 solo lo sacás del array si murió
                if (zombie.hp <= 0) {
                    this.zombies.splice(j, 1);
                }

                break;
            }
        }
    }
}
}