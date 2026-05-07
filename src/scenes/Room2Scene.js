import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class Room2Scene extends BaseRoomScene {

    constructor() {
        super("Room2Scene");
    }

create(data = {}) {
    // 1. FONDO: Lo achicamos al tamaño de la pantalla (800x600)
    // Usamos "background_key" que cargamos en el preload
    this.add.image(400, 300, "background_key").setDisplaySize(800, 600);

    // 2. SPAWN Y BASE
    const x = data.spawnX ?? 400;
    const y = data.spawnY ?? 300;
    this.createBase(x, y);

    // 3. LÓGICA DE LA HABITACIÓN
    this.physics.add.collider(this.zombies, this.zombies);
    this.player.hp = PlayerState.hp;

    // 4. PUERTA DERECHA (Para volver a la Room 1)
    // La ponemos en el borde derecho (780)
    this.doorRight = this.add.rectangle(780, 300, 10, 60, 0xff0000);
    this.physics.add.existing(this.doorRight, true);

    this.canChangeRoom = true;

    this.physics.add.overlap(
        this.player.sprite,
        this.doorRight, // Corregido: antes decía doorLeft
        () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.saveState();

            // Volvemos a la Room 1
            this.scene.start("Room1Scene", {
                spawnX: 100, // Aparecemos lejos de la puerta izquierda de Room 1
                spawnY: 300
            });
        }
    );

    // 🧟 EVENTO DE ZOMBIES (Opcional si querés zombies acá también)
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