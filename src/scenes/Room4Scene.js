import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class Room4Scene extends BaseRoomScene {

    constructor() {
        super("Room4Scene");
    }

    preload() {
        // Podés usar un fondo nuevo o el mismo del patio para testear
        this.load.image("background_room4", "src/background/bg_room4.png");
    }

    create(data = {}) {
        // 1. FONDO
        this.add.image(400, 300, "background_room4").setDisplaySize(800, 600);

        // 2. SPAWN Y BASE
        const x = data.spawnX ?? 400;
        const y = data.spawnY ?? 300;
        this.createBase(x, y);

        // 3. LÓGICA
        this.physics.add.collider(this.zombies, this.zombies);
        this.player.hp = PlayerState.hp;
        this.canChangeRoom = true;

        // --- PUERTA ---

        // 🚪 PUERTA DERECHA (Vuelve al Patio / Room 3)
        this.doorRight = this.add.rectangle(780, 300, 10, 80, 0x00ff00); 
        this.physics.add.existing(this.doorRight, true);

        this.physics.add.overlap(this.player.sprite, this.doorRight, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.saveState();

            this.scene.start("Room3Scene", {
                spawnX: 100, // Aparece a la izquierda en el Patio
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
        const types = ["normal", "fast", "tank"];
        const type = Phaser.Math.RND.pick(types);

        const zombie = new Zombie(this, x, y, type);
        this.zombies.add(zombie.sprite);
        zombie.sprite.ref = zombie;
    }

    update(time, delta) {
        this.updateBase(time, delta);
    }
}
