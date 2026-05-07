import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class U3Scene extends BaseRoomScene {

    constructor() {
        super("U3Scene");
    }

    preload() {
        // Cargamos el fondo de la zona más profunda
        this.load.image("background_u3", "src/background/bg_u3.png");
    }

    create(data = {}) {
        // 1. FONDO (Aún más oscuro o con tintes azules/industriales)
        this.add.image(400, 300, "background_u3").setDisplaySize(800, 600).setTint(0x444444);

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

        // 🛢️ SALIDA A U2 (Derecha, medio arriba)
        // La ponemos en x: 780 y y: 150 (más arriba del centro que es 300)
        this.pipeToU2 = this.add.rectangle(780, 150, 20, 80, 0x00ff00, 0.5);
        this.physics.add.existing(this.pipeToU2, true);

        this.physics.add.overlap(this.player.sprite, this.pipeToU2, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.player.sprite.body.enable = false;
            this.saveState();
            
            // Volvemos a la U2 (Aparecemos donde está el caño de esa sala)
            this.scene.start("U2Scene", { 
                spawnX: 120, // Salimos del caño de la U2
                spawnY: 80 
            });
        });

        // 🧟 SPAWNER (Zona máxima dificultad)
        this.time.addEvent({
            delay: 1200, // Salen rapidísimo
            loop: true,
            callback: () => this.spawnZombie()
        });
    }

    spawnZombie() {
        const x = Phaser.Math.Between(100, 700);
        const y = Phaser.Math.Between(100, 500);
        // Solo Fasts y Tanks en el fondo del sótano
        const type = Phaser.Math.RND.pick(["fast", "fast", "tank"]);
        const zombie = new Zombie(this, x, y, type);
        this.zombies.add(zombie.sprite);
        zombie.sprite.ref = zombie;
    }

    update(time, delta) {
        this.updateBase(time, delta);
    }
}
