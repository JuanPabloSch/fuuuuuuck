import Player from "../entities/Player.js";
import WeaponSystem from "../entities/WeaponSystem.js";
import PlayerState from "../state/PlayerState.js";

export default class BaseRoomScene extends Phaser.Scene {

    constructor(key) {
        super(key);
    }

    // Herramienta para crear paredes
    createWall(x, y, w, h) {
        // Usamos un color visible (0.5 de alpha) para que las veas al testear
        // Cuando estés conforme, cambia el 0.5 por 0 para que sean invisibles
        let wall = this.add.rectangle(x, y, w, h, 0xff0000, 0.5); 
        
        this.walls.add(wall); // Las agregamos al grupo estático
        return wall;
    }

    createBase(x = 400, y = 300) {
        // 🧱 Grupo de paredes (DEBE IR ANTES QUE EL PLAYER PARA LAS COLISIONES)
        this.walls = this.physics.add.staticGroup();

        // 🧍 player
        this.player = new Player(this, x, y);
        this.player.hp = PlayerState.hp;

        // 🔫 weapons
        this.weapon = new WeaponSystem(this, this.player);

        // 🔫 bullets
        this.bullets = [];

        // 🧟 zombies
        this.zombies = this.physics.add.group();

        // --- CONFIGURACIÓN DE COLISIONES GLOBALES ---
        // Esto hace que el player choque con todas las paredes que crees
        this.physics.add.collider(this.player.sprite, this.walls);
        
        // Esto hace que los zombies choquen con las paredes
        this.physics.add.collider(this.zombies, this.walls);
        
        // Esto hace que los zombies choquen entre ellos
        this.physics.add.collider(this.zombies, this.zombies);

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
        this.hudWeaponText = this.add.text(16, 16, "", { fontSize: "18px", fill: "#ffffff" });
        this.hudAmmoText = this.add.text(16, 40, "", { fontSize: "18px", fill: "#ffffff" });
        this.hudHpText = this.add.text(16, 64, "", { fontSize: "18px", fill: "#ff4444" });
        
        this.hudWeaponText.setScrollFactor(0);
        this.hudAmmoText.setScrollFactor(0);
        this.hudHpText.setScrollFactor(0);

        //teclas armas
        this.input.keyboard.on("keydown-ONE", () => this.weapon.setWeapon("pistol"));
        this.input.keyboard.on("keydown-TWO", () => this.weapon.setWeapon("shotgun"));
        this.input.keyboard.on("keydown-THREE", () => this.weapon.setWeapon("rifle"));
        this.input.keyboard.on("keydown-FOUR", () => this.weapon.setWeapon("rocket"));
        this.input.keyboard.on('keydown-P', () => {
            this.scene.pause(); // Congela la acción
            this.scene.launch('PauseScene', { fromScene: this.scene.key }); // Lanza el menú encima
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
        
        this.hudHpText.setText(`HP: ${Math.floor(this.player.hp)}`);
        this.hudWeaponText.setText(`Weapon: ${this.weapon.activeWeapon}`);
        this.hudAmmoText.setText(
            this.weapon.w.reloading
                ? "Reloading..."
                : `Ammo: ${PlayerState.ammo[this.weapon.activeWeapon]}`
        );

        if (this.player.hp <= 0) {
            this.scene.restart();
        }
    }

    // Agregá esto dentro de la clase BaseRoomScene en BaseRoomScene.js
mostrarCartel(mensaje) {
    // Si ya hay un cartel, lo borramos para no encimar
    if (this.cartelTexto) this.cartelTexto.destroy();

    this.cartelTexto = this.add.text(400, 500, mensaje, {
        fontSize: "18px",
        fill: "#ffffff",
        backgroundColor: "#000000aa",
        padding: { x: 10, y: 5 }
    });
    this.cartelTexto.setOrigin(0.5).setDepth(10000); // Bien arriba de todo

    // Se borra solo a los 3 segundos
    this.time.delayedCall(3000, () => {
        if (this.cartelTexto) this.cartelTexto.destroy();
    });
}


    handleCollisions() {
    const zombies = this.zombies.getChildren();
    for (let i = this.bullets.length - 1; i >= 0; i--) {
        const bullet = this.bullets[i];
        
        for (let j = zombies.length - 1; j >= 0; j--) {
            const zombieSprite = zombies[j];
            const zombie = zombieSprite.ref;
            
            // Si es un Rocket (damage 50), aumentamos el radio de detección
            const detectionRadius = (bullet.damage >= 50) ? 60 : 25; 

            const dist = Phaser.Math.Distance.Between(
                bullet.sprite.x, bullet.sprite.y,
                zombie.sprite.x, zombie.sprite.y
            );

            if (dist < detectionRadius) {
                zombie.takeDamage(bullet.damage);
                
                // Si es Rocket, hacemos un pequeño temblor al impactar
                if (bullet.damage >= 50) {
                    this.cameras.main.shake(200, 0.02);
                }

                bullet.destroy();
                this.bullets.splice(i, 1);
                
                if (zombie.hp <= 0) {
                    zombie.destroy();
                    this.zombies.remove(zombieSprite);
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
