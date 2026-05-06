import Player from "../entities/Player.js";
import WeaponSystem from "../entities/WeaponSystem.js";
import PlayerState from "../state/PlayerState.js";

export default class BaseRoomScene extends Phaser.Scene {

    constructor(key) {
        super(key);
    }

    createBase(x = 400, y = 300) {

        // 🧍 player
        this.player = new Player(this, x, y);
        this.player.hp = PlayerState.hp;

        // 🔫 weapons
        this.weapon = new WeaponSystem(this, this.player);

        // 🔫 bullets
        this.bullets = [];

        // 🧟 zombies
        this.zombies = [];

        // 🎮 input (UNA SOLA VEZ)
        this.input.mouse.disableContextMenu();

        this.input.on("pointerdown", (pointer) => {

            if (pointer.leftButtonDown()) {
                this.weapon.shoot(this.time.now, pointer);
            }

            if (pointer.rightButtonDown()) {
                this.weapon.reload();
            }
        });
    }

    updateBase(time, delta) {

        this.player.update();
        this.player.updateRotation(this.input.activePointer);

        this.zombies.forEach(z => z.update(this.player, this.zombies));
        this.bullets.forEach(b => b.update(time, delta));

        this.handleCollisions();
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

                    zombie.takeDamage(bullet.damage);

                    bullet.destroy();
                    this.bullets.splice(i, 1);

                    if (zombie.hp <= 0) {
                        zombie.destroy();
                        this.zombies.splice(j, 1);
                    }

                    break;
                }
            }
        }
    }

    saveState() {
        PlayerState.hp = this.player.hp;
        PlayerState.ammo = this.weapon.weapons;
    }
}