import Player from "../entities/Player.js";
import WeaponSystem from "../entities/WeaponSystem.js";
import PlayerState from "../state/PlayerState.js";

export default class BaseRoomScene extends Phaser.Scene {

    constructor(key) {
        super(key);
    }

    preload() {
    // Esto asegura que TODAS las habitaciones carguen la mira
    this.load.image("crosshair", "src/assets/ui/crosshair.png");
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

        this.input.setDefaultCursor('none');

        // Creamos la imagen de la mira
        this.crosshair = this.add.image(0, 0, "crosshair");
        this.crosshair.setDisplaySize(30, 30);
        this.crosshair.setDepth(10000); 

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

    spawnMedikit(x, y, healAmount = 30) {
    const kit = this.physics.add.sprite(x, y, "medikit");
    
    // 1. ESCALA MUY CHICA
    // Prueba con 0.1 o 0.2 (esto es el 10% o 20% del tamaño original)
    kit.setScale(0.15); 
    kit.setDepth(90);

    // 2. AJUSTE DEL TWEEN (CUIDADO AQUÍ)
    // Si usas scale: 1.2, Phaser lo vuelve a agrandar a su tamaño original.
    // Para que mantenga el tamaño chico, el tween debe basarse en el setScale de arriba.
    this.tweens.add({
        targets: kit,
        scale: 0.18, // Que crezca solo un poquito más de su escala base (0.15)
        duration: 800,
        yoyo: true,
        loop: -1
    });

    this.physics.add.overlap(this.player.sprite, kit, () => {
        this.player.hp = Math.min(100, this.player.hp + healAmount);
        PlayerState.hp = this.player.hp;
        
        this.player.sprite.setTint(0x00ff00);
        this.time.delayedCall(200, () => this.player.sprite.setTint(0xffffff));

        kit.destroy();
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
        if (this.crosshair) {
        this.crosshair.x = this.input.activePointer.worldX;
        this.crosshair.y = this.input.activePointer.worldY;
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
    if (this.player.hp <= 0 && !this.player.isDead) {
        this.player.die();
        this.mostrarCartel("HAS MUERTO...");
        this.time.delayedCall(3000, () => {
            this.scene.restart();
        });
    }
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
