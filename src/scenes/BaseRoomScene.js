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
        this.zombies = this.physics.add.group();

        // 🎮 input (UNA SOLA VEZ)
        this.input.mouse.disableContextMenu();
        this.input.keyboard.resetKeys();
        this.input.on("pointerdown", (pointer) => {

            if (pointer.leftButtonDown()) {
                this.weapon.shoot(this.time.now, pointer);
            }

            if (pointer.rightButtonDown()) {
                this.weapon.reload();
            }
        });
        //HUD
        this.hudWeaponText = this.add.text(16, 16, "", {
            fontSize: "18px",
            fill: "#ffffff"
        });

        this.hudAmmoText = this.add.text(16, 40, "", {
            fontSize: "18px",
            fill: "#ffffff"
        });
                this.hudHpText = this.add.text(16, 64, "", {
            fontSize: "18px",
            fill: "#ff4444"
        });
        this.hudWeaponText.setScrollFactor(0);
        this.hudAmmoText.setScrollFactor(0);
        this.hudHpText.setScrollFactor(0);


        this.physics.add.collider(this.zombies, this.zombies);

        //teclas armas
        this.input.keyboard.on("keydown-ONE", () => {
            this.weapon.setWeapon("pistol");
        });

        this.input.keyboard.on("keydown-TWO", () => {
            this.weapon.setWeapon("shotgun");
        });

        this.input.keyboard.on("keydown-THREE", () => {
            this.weapon.setWeapon("rifle");
        });
            }

    updateBase(time, delta) {

        this.player.update();
        this.player.updateDirection(this.input.activePointer);

        this.zombies.getChildren().forEach(sprite => {
        sprite.ref.update(this.player, this.zombies);
    });
        this.bullets.forEach(b => b.update(time, delta));

        this.handleCollisions();
        this.hudHpText.setText(
            `HP: ${Math.floor(this.player.hp)}`
        );
        this.hudWeaponText.setText(
            `Weapon: ${this.weapon.activeWeapon}`
        );

        this.hudAmmoText.setText(
        this.weapon.w.reloading
            ? "Reloading..."
            : `Ammo: ${PlayerState.ammo[this.weapon.activeWeapon]}`
    );
        if (this.player.hp <= 0) {
        this.scene.restart();
    }
    }

    handleCollisions() {

    const zombies = this.zombies.getChildren();

    for (let i = this.bullets.length - 1; i >= 0; i--) {

        const bullet = this.bullets[i];

        for (let j = zombies.length - 1; j >= 0; j--) {

            const zombieSprite = zombies[j];

            const zombie = zombieSprite.ref;

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

                    this.zombies.remove(zombie.sprite);

                }

                break;
            }
        }
    }
}

    saveState() {
        PlayerState.hp = this.player.hp;
        }
}