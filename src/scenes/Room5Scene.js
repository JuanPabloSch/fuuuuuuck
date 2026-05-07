import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class Room5Scene extends BaseRoomScene {

    constructor() {
        super("Room5Scene");
    }

    preload() {
        // Cargamos el fondo de la habitación 5
        this.load.image("background_room5", "src/background/bg_room5.png");
    }

    create(data = {}) {
        // 1. FONDO
        this.add.image(400, 300, "background_room5").setDisplaySize(800, 600);

        // 2. SPAWN Y BASE
        const x = data.spawnX ?? 400;
        const y = data.spawnY ?? 300;
        this.createBase(x, y);

        // 3. LÓGICA
        this.physics.add.collider(this.zombies, this.zombies);
        this.player.hp = PlayerState.hp;
        this.canChangeRoom = true;

        // --- PUERTAS ---

        // 🚪 PUERTA DERECHA (Vuelve a la Room 4)
        this.doorRight = this.add.rectangle(780, 300, 10, 80, 0x00ff00, 0.5); 
        this.physics.add.existing(this.doorRight, true);

        this.physics.add.overlap(this.player.sprite, this.doorRight, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.saveState();

            this.scene.start("Room4Scene", {
                spawnX: 100, // Entra por la izquierda de la Room 4
                spawnY: 300
            });
        });

        // 🚪 PUERTA IZQUIERDA (Para la futura Room 6 o Final)
        this.doorLeft = this.add.rectangle(20, 300, 10, 80, 0xff00ff, 0.5); 
        this.physics.add.existing(this.doorLeft, true);

        this.physics.add.overlap(this.player.sprite, this.doorLeft, () => {
            if (!this.canChangeRoom) return;
            // Por ahora comentamos el start hasta que tengas la Room 6
            // this.canChangeRoom = false;
            // this.saveState();
            // this.scene.start("Room6Scene", { spawnX: 700, spawnY: 300 });
            console.log("Puerta a Room 6 todavía no creada");
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
