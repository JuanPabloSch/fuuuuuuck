import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class By1Scene extends BaseRoomScene {

    constructor() {
        super("By1Scene");
    }

    preload() {
        // Cargamos el fondo del pasillo by1
        this.load.image("background_by1", "src/background/bg_by1.png");
    }

    create(data = {}) {
        // 1. FONDO
        this.add.image(400, 300, "background_by1").setDisplaySize(800, 600);

        // 2. SPAWN Y BASE
        const x = data.spawnX ?? 400;
        const y = data.spawnY ?? 300;
        this.createBase(x, y);

        this.player.hp = PlayerState.hp;
        
        // --- SEGURO DE ENTRADA ---
        this.canChangeRoom = false;
        this.time.delayedCall(500, () => {
            this.canChangeRoom = true;
        });

        // --- PUERTAS ---

        // 🚪 ABAJO: Volver a la r8
        this.doorDown = this.add.rectangle(400, 580, 100, 15, 0x5555ff, 0.5);
        this.physics.add.existing(this.doorDown, true);
        this.physics.add.overlap(this.player.sprite, this.doorDown, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.player.sprite.body.enable = false;
            this.saveState();
            
            // Regresamos a la parte superior de la r8
            this.scene.start("Room8Scene", { 
                spawnX: 400, 
                spawnY: 100 
            });
        });

        // 🚪 ARRIBA: Ir a by2
        this.doorUp = this.add.rectangle(400, 20, 100, 15, 0x5555ff, 0.5);
        this.physics.add.existing(this.doorUp, true);
        this.physics.add.overlap(this.player.sprite, this.doorUp, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.player.sprite.body.enable = false;
            this.saveState();
            
            // Vamos hacia la siguiente parte del pasillo
            this.scene.start("By2Scene", { 
                spawnX: 400, 
                spawnY: 480 
            });
        });

        // 🧟 SPAWNER (Zona de pasillo, quizás menos zombies pero más rápidos)
        this.time.addEvent({
            delay: 2500,
            loop: true,
            callback: () => this.spawnZombie()
        });
    }

    spawnZombie() {
        const x = Phaser.Math.Between(150, 650); // Pasillo más estrecho
        const y = Phaser.Math.Between(100, 500);
        const zombie = new Zombie(this, x, y, Phaser.Math.RND.pick(["normal", "fast"]));
        this.zombies.add(zombie.sprite);
        zombie.sprite.ref = zombie;
    }

    update(time, delta) {
        this.updateBase(time, delta);
    }
}
