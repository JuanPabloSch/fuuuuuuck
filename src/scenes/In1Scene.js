import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class In1Scene extends BaseRoomScene {
    constructor() {
        super("In1Scene");
    }

    preload() {
        this.load.image("background_in1", "src/background/bg_in1.png");
    }

    create(data = {}) {
        this.add.image(400, 300, "background_in1").setDisplaySize(800, 600);
        this.createBase(data.spawnX ?? 400, data.spawnY ?? 480);

        this.player.hp = PlayerState.hp;
        
        // Seguro de entrada
        this.canChangeRoom = false;
        this.time.delayedCall(500, () => { this.canChangeRoom = true; });

        // --- PAREDES GRUESAS ---
        this.createWall(40, 300, 80, 600);
        this.createWall(760, 300, 80, 600);
        this.createWall(160, 40, 320, 80);  this.createWall(640, 40, 320, 80);
        this.createWall(160, 560, 320, 80); this.createWall(640, 560, 320, 80);
        
        // --- ✨ PARTÍCULAS (Atmósfera) ---
        this.add.particles(0, 0, 'bullet', {
            x: { min: 80, max: 720 },
            y: { min: 80, max: 520 },
            quantity: 1,
            frequency: 150,
            scale: { start: 0.2, end: 0 },
            alpha: { start: 0.4, end: 0 },
            lifespan: 3000,
            speed: 20,
            blendMode: 'ADD'
        });

        // --- 🧟 SPAWNER (Horda) ---
        // 1. Spawneamos 6 de entrada
        for(let i = 0; i < 6; i++) {
            this.spawnZombie();
        }

        // 2. Reloj rápido
        this.time.addEvent({
            delay: 1000, // <--- Un zombie por segundo
            loop: true,
            callback: () => {
                if (this.zombies.getLength() < 15) {
                    this.spawnZombie();
                }
            }
        });

        this.createDoorDown();
        this.createDoorUp();
    }

    // ✅ CORREGIDO: Usamos siempre la variable "z" para evitar el Uncaught ReferenceError
    spawnZombie() {
        const x = Phaser.Math.Between(150, 650);
        const y = Phaser.Math.Between(80, 520);
        
        const type = Phaser.Math.RND.pick(["normal", "fast", "tank", "fast"]);

        const z = new Zombie(this, x, y, type);
        this.zombies.add(z.sprite);
        z.sprite.ref = z; // <--- Acá estaba el error, ahora usa "z"
    }

    createDoorDown() {
        this.doorDown = this.add.rectangle(400, 580, 80, 10, 0x00ffff, 0.5);
        this.physics.add.existing(this.doorDown, true);
        this.physics.add.overlap(this.player.sprite, this.doorDown, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.saveState();
            this.scene.start("Room1Scene", { spawnX: 400, spawnY: 150 });
        });
    }

    createDoorUp() {
        this.doorUp = this.add.rectangle(400, 20, 80, 10, 0xffa500, 0.5);
        this.physics.add.existing(this.doorUp, true);
        this.physics.add.overlap(this.player.sprite, this.doorUp, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.saveState();
            this.scene.start("In2Scene", { spawnX: 400, spawnY: 480 });
        });
    }

    update(time, delta) {
        this.updateBase(time, delta);
    }
}
