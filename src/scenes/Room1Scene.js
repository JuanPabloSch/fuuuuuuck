import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class Room1Scene extends BaseRoomScene {

    constructor() {
        super("Room1Scene");
    }

    preload() {
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

        this.scene.start("Room2Scene", {
            spawnX: 750,
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