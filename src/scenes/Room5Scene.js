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
        this.canChangeRoom = false;
        this.saveState();
        this.scene.start("Room6Scene", { spawnX: 700, spawnY: 300 });
    });

    // --- PAREDES GRUESAS DEL SÓTANO (U1) ---
    // --- PAREDES GRUESAS DEL PASILLO (Room 5) ---

    // 1. PARED SUPERIOR (Sólida de punta a punta)
    this.createWall(400, 40, 800, 80);

    // 2. PARED INFERIOR (Sólida de punta a punta)
    this.createWall(400, 560, 800, 80);

    // 3. PARED IZQUIERDA (Abierta al medio para ir a la Room 6)
    this.createWall(40, 110, 80, 220); // Bloque superior izquierdo
    this.createWall(40, 490, 80, 220); // Bloque inferior izquierdo
    // El hueco para la Room 6 queda en y:300

    // 4. PARED DERECHA (Abierta al medio para volver a la Room 4)
    this.createWall(760, 110, 80, 220); // Bloque superior derecho
    this.createWall(760, 490, 80, 220); // Bloque inferior derecho
    // El hueco para la Room 4 queda en y:300


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
