import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class In2Scene extends BaseRoomScene {
    constructor() {
        super("In2Scene");
    }

    preload() {
        this.load.image("background_in2", "src/background/bg_in2.png");
    }

    create(data = {}) {
        // 1. FONDO
        this.add.image(400, 300, "background_in2").setDisplaySize(800, 600);
        
        // 2. SPAWN Y BASE
        const x = data.spawnX ?? 400;
        const y = data.spawnY ?? 300;
        this.createBase(x, y);

        this.player.hp = PlayerState.hp;
        this.canChangeRoom = true;

        // --- PUERTAS ---

        // 🚪 ABAJO: Volver a In1
        this.doorDown = this.add.rectangle(400, 580, 80, 10, 0xffa500, 0.5);
        this.physics.add.existing(this.doorDown, true);
        this.physics.add.overlap(this.player.sprite, this.doorDown, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.player.sprite.body.enable = false; // Seguridad para evitar bucles
            this.saveState();
            
            this.scene.start("In1Scene", { 
                spawnX: 400, 
                spawnY: 150 // Lejos de la puerta de arriba de In1
            });
        });

        // 🚪 ARRIBA: Para la futura rtop (Room Top)
        this.doorUp = this.add.rectangle(400, 20, 80, 10, 0xff0000, 0.5);
        this.physics.add.existing(this.doorUp, true);
        this.physics.add.overlap(this.player.sprite, this.doorUp, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.player.sprite.body.enable = false;
            this.saveState();
            
            this.scene.start("RtopScene", { 
                spawnX: 400, 
                spawnY: 480 
            });
        });

        // En el create de In2Scene.js
        this.canChangeRoom = false; // Empezamos bloqueado

        // Esperamos medio segundo antes de habilitar las puertas
        this.time.delayedCall(500, () => {
            this.canChangeRoom = true;
        });

        // Y cuando configures el overlap de la puerta de ABAJO
        this.physics.add.overlap(this.player.sprite, this.doorDown, () => {
            // Si canChangeRoom es false, esta función no hace nada
            if (!this.canChangeRoom) return; 

            this.canChangeRoom = false;
            this.player.sprite.body.enable = false;
            this.saveState();
            this.scene.start("In1Scene", { spawnX: 400, spawnY: 150 });
        });


        // 🧟 Spawner de zombies (In2 es zona peligrosa)
        this.time.addEvent({
            delay: 1800,
            loop: true,
            callback: () => this.spawnZombie()
        });
    }

    spawnZombie() {
        const x = Phaser.Math.Between(100, 700);
        const y = Phaser.Math.Between(100, 500);
        // Mezcla de normales y tanques para que sea difícil
        const type = Phaser.Math.RND.pick(["normal", "tank"]);
        const zombie = new Zombie(this, x, y, type);
        this.zombies.add(zombie.sprite);
        zombie.sprite.ref = zombie;
    }

    update(time, delta) {
        this.updateBase(time, delta);
    }
}
