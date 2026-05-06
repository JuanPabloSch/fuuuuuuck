import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class Room2Scene extends BaseRoomScene {

    constructor() {
        super("Room2Scene");
    }

create(data = {}) {

    // 📍 spawn recibido o default
    const x = data.spawnX ?? 400;
    const y = data.spawnY ?? 300;

    this.createBase(x, y);

    this.physics.add.collider(this.zombies, this.zombies);

    // 💾 restaurar estado
    this.player.hp = PlayerState.hp;

    this.doorRight = this.add.rectangle(780, 300, 10, 60, 0xff0000);

    this.physics.add.existing(this.doorRight, true);

    this.canChangeRoom = true;

    // 1. Asegúrate de usar doorRight
this.physics.add.overlap(
    this.player.sprite,
    this.doorRight, // <--- CAMBIADO (antes decía doorLeft)
    () => {
        if (!this.canChangeRoom) return;
        this.canChangeRoom = false;
        this.saveState();

        this.scene.start("Room1Scene", {
            spawnX: 150, // <--- CAMBIADO (antes 50 era muy cerca y volvía a chocar)
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