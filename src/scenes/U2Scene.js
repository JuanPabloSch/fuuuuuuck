import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class U2Scene extends BaseRoomScene {

    constructor() {
        super("U2Scene");
    }

    preload() {
        // Cargamos el fondo del sótano 2
        this.load.image("background_u2", "src/background/bg_u2.png");
    }

    create(data = {}) {
        // 1. FONDO (Un toque más oscuro por ser nivel 2 de sótano)
        this.add.image(400, 300, "background_u2").setDisplaySize(800, 600).setTint(0x555555);

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

        // --- PUERTAS / CONEXIONES ---

        // 🪜 ESCALERA HACIA ARRIBA (Vuelve a r9)
        // Está en el medio arriba
        this.stairsUp = this.add.rectangle(400, 40, 80, 20, 0x555555, 0.8);
        this.physics.add.existing(this.stairsUp, true);
        this.physics.add.overlap(this.player.sprite, this.stairsUp, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.player.sprite.body.enable = false;
            this.saveState();
            
            // Volvemos al centro de la r9
            this.scene.start("Room9Scene", { 
                spawnX: 400, 
                spawnY: 350 // Aparece un poquito abajo de la escalera en r9
            });
        });

        // 🛢️ CAÑO A U3 (Arriba a la izquierda)
        // Ponemos el sensor en la esquina superior izquierda
        this.pipeLeft = this.add.rectangle(50, 50, 60, 60, 0x00ff00, 0.5);
        this.physics.add.existing(this.pipeLeft, true);
        this.physics.add.overlap(this.player.sprite, this.pipeLeft, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.player.sprite.body.enable = false;
            this.saveState();
            
            // Vamos a U3 (que supongo que aparecerás por la derecha)
            this.scene.start("U3Scene", { 
                spawnX: 700, 
                spawnY: 300 
            });
        });

        // 🧟 SPAWNER (Más difícil)
        this.time.addEvent({
            delay: 1500,
            loop: true,
            callback: () => this.spawnZombie()
        });
    }

    spawnZombie() {
        const x = Phaser.Math.Between(100, 700);
        const y = Phaser.Math.Between(100, 500);
        // Sótano profundo: Más chance de Tanks y Fasts
        const type = Phaser.Math.RND.pick(["fast", "tank", "tank", "normal"]);
        const zombie = new Zombie(this, x, y, type);
        this.zombies.add(zombie.sprite);
        zombie.sprite.ref = zombie;
    }

    update(time, delta) {
        this.updateBase(time, delta);
    }
}
