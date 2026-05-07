import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class Room7Scene extends BaseRoomScene {

    constructor() {
        super("Room7Scene");
    }

    preload() {
        // Cargamos el fondo de la r7
        this.load.image("background_r7", "src/background/bg_r7.png");
    }

    create(data = {}) {
        // 1. FONDO
        this.add.image(400, 300, "background_r7").setDisplaySize(800, 600);

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

        // 🚪 IZQUIERDA: Volver al Hub (Room1Scene)
        this.doorLeft = this.add.rectangle(20, 300, 10, 80, 0x00ff00, 0.5);
        this.physics.add.existing(this.doorLeft, true);
        this.physics.add.overlap(this.player.sprite, this.doorLeft, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.player.sprite.body.enable = false;
            this.saveState();

            this.scene.start("Room1Scene", {
                spawnX: 720, // Aparece a la derecha del Hub
                spawnY: 300
            });
        });

        // 🚪 DERECHA: Ir a Room 8 (r8)
        this.doorRight = this.add.rectangle(780, 300, 10, 80, 0x00ffff, 0.5);
        this.physics.add.existing(this.doorRight, true);
        this.physics.add.overlap(this.player.sprite, this.doorRight, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.player.sprite.body.enable = false;
            this.saveState();

            this.scene.start("Room8Scene", {
                spawnX: 80, // Aparece a la izquierda de la Room 8
                spawnY: 300
            });
        });

        // 🧟 SPAWNER
        this.time.addEvent({
            delay: 2000,
            loop: true,
            callback: () => this.spawnZombie()
        });
    }

    spawnZombie() {
        const x = Phaser.Math.Between(100, 700);
        const y = Phaser.Math.Between(100, 500);
        const type = Phaser.Math.RND.pick(["normal", "fast", "tank"]);
        const zombie = new Zombie(this, x, y, type);
        this.zombies.add(zombie.sprite);
        zombie.sprite.ref = zombie;
    }

    update(time, delta) {
        this.updateBase(time, delta);
    }
}
