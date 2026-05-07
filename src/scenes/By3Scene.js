import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class By3Scene extends BaseRoomScene {

    constructor() {
        super("By3Scene");
    }

    preload() {
        // Cargamos el fondo del último tramo del pasillo
        this.load.image("background_by3", "src/background/bg_by3.png");
    }

    create(data = {}) {
        // 1. FONDO
        this.add.image(400, 300, "background_by3").setDisplaySize(800, 600);

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

        // 🚪 ABAJO: Volver a by2
        this.doorDown = this.add.rectangle(400, 580, 100, 15, 0x5555ff, 0.5);
        this.physics.add.existing(this.doorDown, true);
        this.physics.add.overlap(this.player.sprite, this.doorDown, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.player.sprite.body.enable = false;
            this.saveState();
            
            this.scene.start("By2Scene", { 
                spawnX: 400, 
                spawnY: 150 
            });
        });

        // 🚪 DERECHA: ¡ZONA DE ESCAPE!
        this.doorRight = this.add.rectangle(780, 300, 15, 100, 0xffff00, 0.8); // Color oro para el escape
        this.physics.add.existing(this.doorRight, true);
        this.physics.add.overlap(this.player.sprite, this.doorRight, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.player.sprite.body.enable = false;
            this.saveState();
            
            // Vamos a la escena final
            this.scene.start("EscapeScene", { 
                spawnX: 80, 
                spawnY: 300 
            });
        });

        // 🧟 SPAWNER (Último esfuerzo antes del escape)
        this.time.addEvent({
            delay: 1500,
            loop: true,
            callback: () => this.spawnZombie()
        });
    }

    spawnZombie() {
        const x = Phaser.Math.Between(150, 650);
        const y = Phaser.Math.Between(100, 500);
        // Aquí podrías meter más tanques para que el escape sea difícil
        const type = Phaser.Math.RND.pick(["tank", "fast", "normal"]);
        const zombie = new Zombie(this, x, y, type);
        this.zombies.add(zombie.sprite);
        zombie.sprite.ref = zombie;
    }

    update(time, delta) {
        this.updateBase(time, delta);
    }
}
