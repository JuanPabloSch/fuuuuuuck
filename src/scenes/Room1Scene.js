import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class Room1Scene extends BaseRoomScene {

    constructor() {
        super("Room1Scene");
    }

    preload() {
    // En tu preload
    this.load.spritesheet("zombie_normal", "src/assets/zombie.png", {
        frameWidth: 168, // 672 dividido 4
        frameHeight: 253 // El alto total
    });

     // Zombie Fast (640x256) -> 640 / 4 = 160
    this.load.spritesheet("zombie_fast", "src/assets/zombie_fast.png", {
        frameWidth: 160, 
        frameHeight: 256 
    });

    // 🛡️ Zombie Tank (852x278)
    this.load.spritesheet("zombie_tank", "src/assets/tankzombie.png", {
        frameWidth: 213, 
        frameHeight: 278 
    });

    // Tu player
    this.load.spritesheet("player", "src/assets/player.png", {
        frameWidth: 168,
        frameHeight: 272
    });
}


create(data = {}) {

    // 📍 spawn recibido o default
    const x = data.spawnX ?? 400;
    const y = data.spawnY ?? 300;

    this.createBase(x, y);

    this.physics.add.collider(this.zombies, this.zombies);

    // 💾 restaurar estado
    this.player.hp = PlayerState.hp;

    this.doorLeft = this.add.rectangle(20, 300, 10, 60, 0x00ff00);

    this.physics.add.existing(this.doorLeft, true);

this.canChangeRoom = true;

this.physics.add.overlap(
    this.player.sprite,
    this.doorLeft,
    () => {

        if (!this.canChangeRoom) return;

        this.canChangeRoom = false;

        this.saveState();

        // Cambia el spawnX de 750 a algo más lejos del borde para que el sprite entre entero
        this.scene.start("Room2Scene", {
            spawnX: 700, // Más lejos del borde derecho
            spawnY: 300
        });
    }
);


    // 🧟 zombies
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