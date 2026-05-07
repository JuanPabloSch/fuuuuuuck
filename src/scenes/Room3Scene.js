import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class Room3Scene extends BaseRoomScene {

    constructor() {
        super("Room3Scene");
    }

    preload() {
        // Cargamos el fondo del Patio
        this.load.image("background_patio", "src/background/bg_patio.png");
    }

    create(data = {}) {
        // 1. FONDO: Ajustado a 800x600 como las anteriores
        this.add.image(400, 300, "background_patio").setDisplaySize(800, 600);

        // 2. SPAWN Y BASE
        const x = data.spawnX ?? 400;
        const y = data.spawnY ?? 300;
        this.createBase(x, y);

        // 3. LÓGICA
        this.physics.add.collider(this.zombies, this.zombies);
        this.player.hp = PlayerState.hp;
        this.canChangeRoom = true;

        // --- PUERTAS ---

        // 🚪 PUERTA ABAJO (Vuelve a la Room 2)
        this.doorDown = this.add.rectangle(400, 580, 80, 10, 0xffff00); // Amarillo
        this.physics.add.existing(this.doorDown, true);

        this.physics.add.overlap(this.player.sprite, this.doorDown, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.saveState();

            this.scene.start("Room2Scene", {
                spawnX: 400,
                spawnY: 100 // Aparece abajo de la puerta superior de la Room 2
            });
        });

        // 🚪 PUERTA IZQUIERDA (Para ir a la futura Room 4)
        this.doorLeft = this.add.rectangle(20, 300, 10, 80, 0xff00ff); // Violeta
        this.physics.add.existing(this.doorLeft, true);

        this.physics.add.overlap(this.player.sprite, this.doorLeft, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.saveState();

            // Esto asume que crearás una Room4Scene después
            this.scene.start("Room4Scene", {
                spawnX: 700, 
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
