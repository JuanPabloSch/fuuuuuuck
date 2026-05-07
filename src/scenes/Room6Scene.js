import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class Room6Scene extends BaseRoomScene {

    constructor() {
        super("Room6Scene");
    }

    preload() {
        // Cargamos el fondo de la habitación 6
        this.load.image("background_room6", "src/background/bg_room6.png");
    }

    create(data = {}) {
        // 1. FONDO
        this.add.image(400, 300, "background_room6").setDisplaySize(800, 600);

        // 2. SPAWN Y BASE
        const x = data.spawnX ?? 400;
        const y = data.spawnY ?? 300;
        this.createBase(x, y);

        // 3. LÓGICA
        this.physics.add.collider(this.zombies, this.zombies);
        this.player.hp = PlayerState.hp;
        this.canChangeRoom = true;

        // --- PUERTAS ---

        // 🚪 PUERTA DERECHA (Vuelve a la Room 5)
        this.doorRight = this.add.rectangle(780, 300, 10, 80, 0x00ff00, 0.5); 
        this.physics.add.existing(this.doorRight, true);

        this.physics.add.overlap(this.player.sprite, this.doorRight, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.saveState();

            this.scene.start("Room5Scene", {
                spawnX: 100, // Entra por la izquierda de la Room 5
                spawnY: 300
            });
        });

        // 🧟 SPAWNER DE ZOMBIES
        this.time.addEvent({
            delay: 2000,
            loop: true,
            callback: () => this.spawnZombie()
        });
    }

    spawnZombie() {
        const x = Phaser.Math.Between(100, 700);
        const y = Phaser.Math.Between(100, 500);
        const zombie = new Zombie(this, x, y, Phaser.Math.RND.pick(["normal", "fast", "tank"]));
        this.zombies.add(zombie.sprite);
        zombie.sprite.ref = zombie;
    }

    update(time, delta) {
        this.updateBase(time, delta);
    }
}
